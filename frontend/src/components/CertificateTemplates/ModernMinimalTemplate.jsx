import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function ModernMinimalTemplate({ data }) {
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
  const displayCourse = courseTitle.trim() || 'B.Tech Information Technology - Distributed Systems & Blockchain Architecture';
  const displayIssuer = issuerName.trim() || 'COEP Technological University, Pune';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-white text-slate-900 p-5 sm:p-7 flex flex-col justify-between relative border border-slate-200 select-none font-sans overflow-hidden box-border">
      {/* Top Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />
      <div className="absolute top-2.5 left-0 bottom-0 w-2 bg-blue-600" />

      {/* Header */}
      <div className="flex justify-between items-start pt-1 pl-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Official Credential
          </span>
          <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            CERTIFICATE OF EXCELLENCE
          </h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issued By</p>
          <p className="text-xs font-bold text-slate-800 max-w-[200px] truncate">{displayIssuer}</p>
        </div>
      </div>

      {/* Recipient & Course */}
      <div className="my-auto pl-3 py-2">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Proudly Conferred Upon</p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-0.5 tracking-tight">
          {displayName}
        </h2>
        <p className="text-xs text-slate-600 mt-2 max-w-lg leading-relaxed">
          In recognition of demonstrating high proficiency, rigorous dedication, and exceptional performance in:
        </p>
        <div className="inline-block bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg mt-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900">{displayCourse}</span>
        </div>
      </div>

      {/* Footer Details & QR */}
      <div className="flex items-end justify-between pl-3 pt-2 border-t border-slate-100">
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-400">Date:</span>
            <span className="text-xs font-bold text-slate-700">{displayDate}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-slate-400">Cert ID:</span>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {displayCertId}
            </span>
          </div>
          <div className="text-[8px] font-mono text-slate-400 max-w-[200px] truncate">
            RSA Sig: {digitalSignature || 'SECURED_BY_SHA256_RSA2048'}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <div className="w-20 border-b border-slate-300 pb-0.5" />
            <span className="text-[9px] text-slate-400 font-medium">Head of Department</span>
          </div>
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} />
        </div>
      </div>
    </div>
  );
}
