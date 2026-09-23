import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function VintageHeritageTemplate({ data }) {
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
  const displayCourse = courseTitle.trim() || 'Executive M.Tech in Cybersecurity & Digital Signature Verification';
  const displayIssuer = issuerName.trim() || 'Birla Institute of Technology & Science (BITS Pilani)';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#faf6ed] text-[#2c1810] p-5 sm:p-7 flex flex-col justify-between relative border-[8px] sm:border-[10px] border-[#7f1d1d] select-none font-serif box-border">
      {/* Vintage Dual Border */}
      <div className="absolute inset-1.5 border border-[#b45309] pointer-events-none opacity-60" />
      <div className="absolute inset-2.5 border border-[#d97706] pointer-events-none opacity-40" />

      {/* Header */}
      <div className="text-center relative z-10 pt-1">
        <p className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.25em] text-[#b45309] uppercase">
          {displayIssuer}
        </p>
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#7f1d1d] tracking-wide uppercase mt-0.5">
          Diploma of Distinction
        </h1>
        <p className="text-[10px] sm:text-xs italic text-[#5c3a21] mt-0.5 font-serif">
          Let it be known to all that
        </p>
      </div>

      {/* Recipient */}
      <div className="text-center my-auto relative z-10 py-1 sm:py-2">
        <h2 className="text-xl sm:text-3xl font-extrabold text-[#2c1810] tracking-normal border-b-2 border-[#b45309] inline-block pb-1 px-6">
          {displayName}
        </h2>
        <p className="text-[11px] sm:text-xs text-[#5c3a21] mt-2 max-w-lg mx-auto leading-relaxed">
          has fulfilled the required academic curriculum and is hereby conferred this credential in
        </p>
        <h3 className="text-xs sm:text-base font-bold text-[#7f1d1d] mt-1 px-2">
          {displayCourse}
        </h3>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-[#d5c3aa]">
        <div className="text-left font-sans text-xs space-y-0.5">
          <div><span className="text-[#8c6d53] text-[10px]">Awarded on:</span> <span className="font-bold text-[#2c1810] text-xs">{displayDate}</span></div>
          <div><span className="text-[#8c6d53] text-[10px]">Registry ID:</span> <span className="font-mono font-bold text-[#7f1d1d] text-xs">{displayCertId}</span></div>
          <div className="text-[8px] font-mono text-[#8c6d53] max-w-[180px] truncate">
            {digitalSignature ? `RSA: ${digitalSignature.substring(0, 18)}...` : 'Immutable Record'}
          </div>
        </div>

        {/* Vintage Seal */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border border-[#7f1d1d] bg-[#7f1d1d] text-amber-100 flex items-center justify-center shadow-sm">
            <span className="text-[7.5px] font-bold tracking-tight text-center uppercase leading-tight">
              BITS<br />SEAL
            </span>
          </div>
          <span className="text-[8.5px] text-[#8c6d53] mt-0.5 font-sans">Registrar</span>
        </div>

        <div>
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} />
        </div>
      </div>
    </div>
  );
}
