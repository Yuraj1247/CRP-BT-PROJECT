import React from 'react';
import { Shield, Lock, FileCode, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Certificate Shield Verification Platform</span>
            <span>&bull;</span>
            <span>AES-256 Storage &bull; RSA-2048 Signatures &bull; SHA-256 Hashing &bull; Blockchain Ledger</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Firebase Spark Free Plan
            </span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              Nodemailer Dispatch
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
