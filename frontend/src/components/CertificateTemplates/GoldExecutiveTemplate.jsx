import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function GoldExecutiveTemplate({ data }) {
  const {
    recipientName = '',
    courseTitle = '',
    issuerName = '',
    issueDate = '',
    certificateId = '',
    digitalSignature = '',
    verificationUrl = ''
  } = data || {};

  const displayName = recipientName.trim() || '[Participant Full Name]';
  const displayCourse = courseTitle.trim() || 'Advanced Certification in Quantum-Resistant Cryptography & AES Security';
  const displayIssuer = issuerName.trim() || 'Indian Institute of Technology Bombay (IIT Bombay)';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#fcfcfc] text-slate-900 p-5 sm:p-7 flex flex-col justify-between relative border-[6px] sm:border-[8px] border-[#0f172a] select-none box-border">
      {/* Gold Inner Framing */}
      <div className="absolute inset-1 border border-[#d97706] pointer-events-none" />
      <div className="absolute inset-2 border border-[#fef3c7] pointer-events-none" />

      {/* Decorative Gold Corner Accents */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#d97706]" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#d97706]" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#d97706]" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#d97706]" />

      {/* Header */}
      <div className="text-center relative z-10 pt-1">
        <p className="text-[10px] sm:text-xs font-serif tracking-[0.25em] text-[#b45309] uppercase font-semibold">
          {displayIssuer}
        </p>
        <h1 className="text-lg sm:text-2xl font-black tracking-widest text-[#0f172a] uppercase mt-0.5 font-serif">
          Certificate of Completion
        </h1>
        <div className="w-12 h-0.5 bg-[#d97706] mx-auto mt-1" />
      </div>

      {/* Recipient Body */}
      <div className="text-center my-auto relative z-10 py-1 sm:py-2">
        <p className="text-[10px] sm:text-xs text-slate-500 italic">This distinction is officially awarded to</p>
        <h2 className="text-xl sm:text-3xl font-extrabold text-[#0f172a] font-serif tracking-wide mt-1">
          {displayName}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
          For exemplary completion and validated competence in the accredited program:
        </p>
        <h3 className="text-xs sm:text-base font-bold text-[#b45309] mt-1 font-serif px-2">
          {displayCourse}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-amber-200">
        <div className="text-left font-sans text-xs space-y-0.5">
          <div><span className="text-[10px] text-slate-400">Date:</span> <span className="font-semibold text-slate-800 text-xs">{displayDate}</span></div>
          <div><span className="text-[10px] text-slate-400">ID:</span> <span className="font-mono font-bold text-[#0f172a] text-xs">{displayCertId}</span></div>
          <div className="text-[8px] font-mono text-slate-400 max-w-[180px] truncate">
            {digitalSignature ? `RSA-SHA256: ${digitalSignature.substring(0, 18)}...` : 'AES-256 Encrypted Record'}
          </div>
        </div>

        {/* Gold Seal Graphic */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-[#d97706] bg-gradient-to-tr from-amber-200 via-amber-100 to-amber-50 flex items-center justify-center shadow-sm">
            <span className="text-[7px] font-serif font-black text-[#78350f] tracking-tighter text-center uppercase">
              IIT BOMBAY<br />SEAL
            </span>
          </div>
          <span className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">Programme Director</span>
        </div>

        {/* QR Code */}
        <div>
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} />
        </div>
      </div>
    </div>
  );
}
