import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function CyberTechTemplate({ data }) {
  const {
    recipientName = '',
    courseTitle = '',
    issuerName = '',
    issueDate = '',
    certificateId = '',
    digitalSignature = '',
    certificateHash = '',
    verificationUrl = ''
  } = data || {};

  const displayName = recipientName.trim() || '[Participant Full Name]';
  const displayCourse = courseTitle.trim() || 'National Level Blockchain & Cryptography Hackathon (Technovanza)';
  const displayIssuer = issuerName.trim() || 'Veermata Jijabai Technological Institute (VJTI), Mumbai';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';

  const shortHash = certificateHash 
    ? `${certificateHash.substring(0, 14)}...${certificateHash.substring(certificateHash.length - 6)}` 
    : 'SHA256: 7f83b165...';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#f8fafc] text-slate-900 p-5 sm:p-7 flex flex-col justify-between relative border-[6px] sm:border-[8px] border-slate-900 select-none font-mono box-border">
      {/* Circuit / Tech Matrix Framing */}
      <div className="flex justify-between items-center text-[9px] text-blue-600 font-bold border-b border-slate-200 pb-1">
        <span>[TECHNOVANZA_VJTI_SECURE_VERIFIED]</span>
        <span className="text-slate-500">AES-256-GCM // RSA-2048</span>
      </div>
      
      {/* Header */}
      <div className="pt-2 pb-1">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-700 uppercase">
            {displayIssuer}
          </span>
        </div>
        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 uppercase mt-0.5 font-sans">
          CRYPTOGRAPHIC HACKATHON MERIT
        </h1>
      </div>

      {/* Body */}
      <div className="my-auto py-1 sm:py-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-sans">Credential Conferred To:</p>
        <h2 className="text-xl sm:text-3xl font-extrabold text-blue-900 font-sans tracking-tight mt-0.5">
          {displayName}
        </h2>
        <div className="mt-2 p-2 bg-white border border-slate-200 rounded">
          <span className="text-[9px] text-slate-400 font-sans block">Event / Specialization:</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 font-sans">
            {displayCourse}
          </span>
        </div>
      </div>

      {/* Footer Details & Security Grid */}
      <div className="flex items-end justify-between pt-2 border-t border-slate-300">
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-400">TIMESTAMP:</span>
            <span className="font-bold text-slate-700 text-xs">{displayDate}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-400">HASH:</span>
            <span className="font-mono text-[9px] text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
              {shortHash}
            </span>
          </div>
          <div className="text-[9px] text-slate-500">
            ID: <span className="font-bold text-slate-900">{displayCertId}</span>
          </div>
        </div>

        <div>
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} label="LEDGER QR" />
        </div>
      </div>
    </div>
  );
}
