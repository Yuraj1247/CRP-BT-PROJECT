import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function AcademicTemplate({ data }) {
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
  const displayCourse = courseTitle.trim() || 'B.Tech Computer Engineering - Cryptography & Network Security';
  const displayIssuer = issuerName.trim() || 'Veermata Jijabai Technological Institute (VJTI), Mumbai';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';
  const sigShort = digitalSignature ? `${digitalSignature.substring(0, 18)}...` : 'RSA-2048 DIGITALLY SIGNED';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-[#fdfcfa] text-slate-900 p-5 sm:p-7 flex flex-col justify-between relative border-[8px] sm:border-[10px] border-[#1e293b] select-none font-serif box-border">
      {/* Decorative Inner Borders */}
      <div className="absolute inset-1.5 border border-[#b45309] pointer-events-none opacity-80" />
      <div className="absolute inset-3 border border-slate-200 pointer-events-none" />

      {/* Header */}
      <div className="text-center relative z-10 pt-1">
        <div className="flex items-center justify-center space-x-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-[#1e293b] text-[#fbbf24] flex items-center justify-center text-sm font-bold shadow-sm">
            🏛️
          </div>
          <p className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] text-[#b45309] uppercase">
            {displayIssuer}
          </p>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 font-serif uppercase">
          Certificate of Achievement
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500 italic mt-0.5 font-sans">
          This is proudly presented to
        </p>
      </div>

      {/* Recipient & Course */}
      <div className="text-center my-auto relative z-10 py-1 sm:py-2">
        <h2 className="text-xl sm:text-3xl font-bold text-slate-900 border-b-2 border-[#1e293b] inline-block pb-1 px-6 font-serif">
          {displayName}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 font-sans max-w-lg mx-auto mt-2 leading-relaxed">
          for successfully fulfilling all curriculum requirements and demonstrating mastery in
        </p>
        <h3 className="text-sm sm:text-lg font-bold text-[#1e3a8a] mt-1.5 font-sans tracking-wide px-2">
          {displayCourse}
        </h3>
      </div>

      {/* Footer Details & QR */}
      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-slate-200">
        {/* Date & ID */}
        <div className="text-left font-sans text-xs">
          <div className="text-[10px] text-slate-500">Issue Date</div>
          <div className="text-xs font-semibold text-slate-800">{displayDate}</div>
          <div className="text-[9px] font-mono text-slate-600 mt-1">
            ID: <span className="font-bold text-slate-900">{displayCertId}</span>
          </div>
          <div className="text-[8px] font-mono text-slate-400 max-w-[180px] truncate" title={digitalSignature}>
            Sig: {sigShort}
          </div>
        </div>

        {/* Center Authority Seal */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="w-11 h-11 rounded-full border border-[#b45309] bg-amber-50 flex items-center justify-center shadow-inner">
            <span className="text-[7.5px] text-center font-bold text-[#b45309] uppercase leading-tight">
              VJTI<br />VERIFIED
            </span>
          </div>
          <div className="w-20 border-b border-slate-400 mt-1.5" />
          <span className="text-[8.5px] font-sans text-slate-500 mt-0.5">Dean / Registrar</span>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-end">
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} />
        </div>
      </div>
    </div>
  );
}
