import { 
  makeSTXTokenTransfer, 
  broadcastTransaction, 
  AnchorMode, 
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { generateSecretKey, generateWallet } from '@stacks/wallet-sdk';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import { config } from '../config.js';

interface WalletData {
  privateKey: string;
  address: string;
}

export class WalletManager {
  private db: Database.Database;
  private network: StacksTestnet | StacksMainnet;
  private encryptionKey: Buffer;

  constructor() {
    this.db = new Database(config.walletDbPath);
    this.network = config.stacksNetwork === 'mainnet' 
      ? new StacksMainnet() 
      : new StacksTestnet();
    
    this.encryptionKey = crypto.scryptSync(
      config.walletEncryptionSecret,
      'x402-stacks-salt',
      32
    );

    this.initDatabase();
  }

  private initDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_wallets (
        userId            TEXT PRIMARY KEY,
        stxAddress        TEXT NOT NULL UNIQUE,
        encryptedPrivKey  TEXT NOT NULL,
        network           TEXT NOT NULL DEFAULT 'testnet',
        createdAt         TEXT NOT NULL,
        lastUsedAt        TEXT
      );

      CREATE TABLE IF NOT EXISTS payment_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        userId      TEXT NOT NULL,
        txId        TEXT NOT NULL UNIQUE,
        recipient   TEXT NOT NULL,
        microSTX    TEXT NOT NULL,
        service     TEXT,
        timestamp   TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES agent_wallets(userId)
      );
    `);
  }

  private encryptPrivateKey(privateKey: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  private decryptPrivateKey(encryptedData: string): string {
    const [ivHex, authTagHex, encryptedHex] = encryptedData.split(':');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async createWallet(userId: string): Promise<{ address: string }> {
    const existingWallet = this.getWallet(userId);
    if (existingWallet) {
      return { address: existingWallet.address };
    }

    const mnemonic = generateSecretKey();
    const wallet = await generateWallet({
      secretKey: mnemonic,
      password: ''
    });

    const account = wallet.accounts[0];
    const privateKey = account.stxPrivateKey;
    
    const transactionVersion = config.stacksNetwork === 'mainnet' 
      ? TransactionVersion.Mainnet 
      : TransactionVersion.Testnet;
    
    const address = getAddressFromPrivateKey(privateKey, transactionVersion);

    const encryptedPrivKey = this.encryptPrivateKey(privateKey);
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO agent_wallets (userId, stxAddress, encryptedPrivKey, network, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(userId, address, encryptedPrivKey, config.stacksNetwork, now);

    console.error(`[WalletManager] Created new wallet for user ${userId}: ${address}`);

    return { address };
  }

  getWallet(userId: string): WalletData | null {
    const stmt = this.db.prepare(`
      SELECT stxAddress, encryptedPrivKey FROM agent_wallets WHERE userId = ?
    `);
    
    const row = stmt.get(userId) as { stxAddress: string; encryptedPrivKey: string } | undefined;
    
    if (!row) {
      return null;
    }

    const privateKey = this.decryptPrivateKey(row.encryptedPrivKey);
    
    this.db.prepare(`
      UPDATE agent_wallets SET lastUsedAt = ? WHERE userId = ?
    `).run(new Date().toISOString(), userId);

    return {
      privateKey,
      address: row.stxAddress
    };
  }

  async getOrCreateWallet(userId: string): Promise<WalletData> {
    let wallet = this.getWallet(userId);
    
    if (!wallet) {
      const { address } = await this.createWallet(userId);
      wallet = this.getWallet(userId);
      
      if (!wallet) {
        throw new Error(`Failed to create wallet for user ${userId}`);
      }
    }

    return wallet;
  }

  async getBalance(address: string): Promise<bigint> {
    const apiUrl = config.stacksNetwork === 'mainnet'
      ? `https://api.hiro.so/v2/accounts/${address}`
      : `https://api.testnet.hiro.so/v2/accounts/${address}`;

    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.statusText}`);
      }

      const data = await response.json();
      return BigInt(data.balance || '0');
    } catch (error) {
      console.error(`[WalletManager] Error fetching balance for ${address}:`, error);
      return 0n;
    }
  }

  async sendSTX(userId: string, recipient: string, microSTXAmount: bigint): Promise<string> {
    const wallet = await this.getOrCreateWallet(userId);
    
    const balance = await this.getBalance(wallet.address);
    
    if (balance < microSTXAmount) {
      throw new Error(
        `Insufficient STX balance. Agent wallet ${wallet.address} has ${balance} microSTX but needs ${microSTXAmount} microSTX. ` +
        `Fund the wallet at: https://explorer.hiro.so/sandbox/faucet?chain=testnet`
      );
    }

    const txOptions = {
      recipient,
      amount: microSTXAmount,
      senderKey: wallet.privateKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 200n,
    };

    const transaction = await makeSTXTokenTransfer(txOptions);
    const broadcastResponse = await broadcastTransaction(transaction, this.network);

    if ('error' in broadcastResponse) {
      throw new Error(`Transaction broadcast failed: ${broadcastResponse.error}`);
    }

    const txId = broadcastResponse.txid;

    const stmt = this.db.prepare(`
      INSERT INTO payment_log (userId, txId, recipient, microSTX, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      userId,
      txId,
      recipient,
      microSTXAmount.toString(),
      new Date().toISOString()
    );

    console.error(`[WalletManager] Sent ${microSTXAmount} microSTX to ${recipient} | tx: ${txId}`);

    return txId;
  }

  close(): void {
    this.db.close();
  }
}
