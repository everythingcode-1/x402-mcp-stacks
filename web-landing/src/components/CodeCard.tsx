import React from 'react';

interface CodeCardProps {
  title?: string;
  code: string;
  language?: string;
}

export const CodeCard: React.FC<CodeCardProps> = ({ 
  title = "code.tsx", 
  code,
  language = "typescript" 
}) => {
  return (
    <div className="relative rounded-lg bg-slate-900 p-2 shadow-xl">
      <div className="relative flex text-center">
        <div className="flex pl-3.5 pt-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.5 mr-1.5 h-3 w-3 text-red-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.75 mr-1.5 h-3 w-3 text-yellow-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.75 mr-1.5 h-3 w-3 text-green-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
        </div>
        <span className="absolute inset-x-0 top-2 text-xs text-slate-500">{title}</span>
      </div>
      <div className="mt-5 px-5 pb-6">
        <pre className="overflow-x-auto">
          <code className="text-xs font-mono leading-relaxed text-slate-300">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
};

interface SyntaxCodeCardProps {
  title?: string;
  children: React.ReactNode;
}

export const SyntaxCodeCard: React.FC<SyntaxCodeCardProps> = ({ 
  title = "example.tsx", 
  children 
}) => {
  return (
    <div className="relative rounded-lg bg-slate-900 p-2 shadow-xl">
      <div className="relative flex text-center">
        <div className="flex pl-3.5 pt-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.5 mr-1.5 h-3 w-3 text-red-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.75 mr-1.5 h-3 w-3 text-yellow-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="-ml-0.75 mr-1.5 h-3 w-3 text-green-500/20">
            <circle r={12} cy={12} cx={12} />
          </svg>
        </div>
        <span className="absolute inset-x-0 top-2 text-xs text-slate-500">{title}</span>
      </div>
      <div className="mt-5 space-y-1.5 px-5 pb-6 overflow-x-auto">
        <div className="font-mono text-xs font-normal tracking-wide">
          {children}
        </div>
      </div>
    </div>
  );
};
