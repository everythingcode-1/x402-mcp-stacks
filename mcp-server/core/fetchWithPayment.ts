import { WalletManager } from './walletManager.js';

interface PaymentRequirements {
  payTo: string;
  amount: string;
  tokenType: string;
  network: string;
  facilitatorUrl: string;
  scheme: string;
}

interface FetchWithPaymentOptions {
  userId: string;
  walletManager: WalletManager;
  maxRetries?: number;
  waitForConfirmation?: boolean;
}

export async function fetchWithPayment(
  url: string,
  fetchOptions: RequestInit,
  paymentOptions: FetchWithPaymentOptions
): Promise<Response> {
  const { userId, walletManager, maxRetries = 3, waitForConfirmation = false } = paymentOptions;

  let response = await fetch(url, fetchOptions);

  if (response.status !== 402) {
    return response;
  }

  console.error(`[x402] Received 402 Payment Required from ${url}`);

  let responseBody: any;
  try {
    responseBody = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse 402 response body: ${error}`);
  }

  let paymentReq: PaymentRequirements;

  if (responseBody.accepts && Array.isArray(responseBody.accepts) && responseBody.accepts.length > 0) {
    const accept = responseBody.accepts[0];
    paymentReq = {
      payTo: accept.payTo,
      amount: accept.amount,
      tokenType: accept.asset || 'STX',
      network: accept.network,
      facilitatorUrl: accept.facilitatorUrl || '',
      scheme: accept.scheme
    };
  } else if (responseBody.paymentRequirements) {
    paymentReq = responseBody.paymentRequirements;
  } else {
    throw new Error('402 response missing payment requirements (neither accepts nor paymentRequirements field found)');
  }

  if (paymentReq.tokenType !== 'STX') {
    throw new Error(`Unsupported token type: ${paymentReq.tokenType}. Only STX is supported in this version.`);
  }

  const microSTXAmount = BigInt(paymentReq.amount);
  const wallet = await walletManager.getOrCreateWallet(userId);
  const balance = await walletManager.getBalance(wallet.address);

  if (balance < microSTXAmount) {
    throw new Error(
      `Insufficient STX balance. Agent wallet ${wallet.address} has ${balance} microSTX but needs ${microSTXAmount} microSTX. ` +
      `Fund the wallet at: https://explorer.hiro.so/sandbox/faucet?chain=testnet`
    );
  }

  console.error(`[x402] Paying ${microSTXAmount} microSTX to ${paymentReq.payTo}...`);

  const txId = await walletManager.sendSTX(userId, paymentReq.payTo, microSTXAmount);

  console.error(`[x402] Payment broadcast successful. TxID: ${txId}`);

  await new Promise(resolve => setTimeout(resolve, waitForConfirmation ? 5000 : 2000));

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.error(`[x402] Retrying request with payment signature (attempt ${attempt}/${maxRetries})...`);

    const retryHeaders = {
      ...fetchOptions.headers,
      'payment-signature': txId,
    };

    const retryResponse = await fetch(url, {
      ...fetchOptions,
      headers: retryHeaders,
    });

    if (retryResponse.status !== 402) {
      console.error(`[x402] Payment verified! Request successful.`);
      return retryResponse;
    }

    if (attempt < maxRetries) {
      console.error(`[x402] Payment not yet verified, waiting before retry...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  throw new Error(
    `Payment verification failed after ${maxRetries} retries. TxID: ${txId}. ` +
    `Check transaction status at: https://explorer.hiro.so/txid/${txId}?chain=testnet`
  );
}
