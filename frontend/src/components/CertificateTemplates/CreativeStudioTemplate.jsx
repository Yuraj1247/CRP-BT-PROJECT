import React from 'react';
import CertificateQRCode from './CertificateQRCode';

export default function CreativeStudioTemplate({ data }) {
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
  const displayCourse = courseTitle.trim() || 'Advanced Fellowship in Cryptographic Protocol Engineering';
  const displayIssuer = issuerName.trim() || 'Indian Institute of Science (IISc), Bengaluru';
  const displayDate = issueDate.trim() || new Date().toISOString().split('T')[0];
  const displayCertId = certificateId.trim() || 'CERT-2026-PENDING';

  return (
    <div className="w-full h-full min-h-[440px] sm:min-h-[480px] bg-white text-slate-900 p-5 sm:p-7 flex flex-col justify-between relative border-[5px] sm:border-[6px] border-emerald-600 select-none font-sans overflow-hidden box-border">
      {/* Background Shapes */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-teal-50 rounded-tr-full pointer-events-none -z-0" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Certificate of Participation
          </span>
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
            RESEARCH & WORKSHOP
          </h1>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Organized by</span>
          <p className="text-xs font-extrabold text-emerald-700 max-w-[200px] truncate">{displayIssuer}</p>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 my-auto py-1 sm:py-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Awarded To</p>
        <h2 className="text-xl sm:text-3xl font-black text-emerald-950 mt-0.5">
          {displayName}
        </h2>
        <p className="text-[11px] sm:text-xs text-slate-600 mt-2 max-w-md leading-relaxed">
          For active participation, research problem solving, and demonstrated mastery in:
        </p>
        <p className="text-xs sm:text-base font-bold text-teal-800 mt-1 bg-emerald-50/70 inline-block px-2.5 py-1 rounded-md">
          {displayCourse}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-end justify-between pt-2 border-t border-emerald-100">
        <div className="text-xs space-y-0.5">
          <div><span className="text-[10px] text-slate-400">Date:</span> <span className="font-bold text-slate-800 text-xs">{displayDate}</span></div>
          <div><span className="text-[10px] text-slate-400">Token ID:</span> <span className="font-mono font-bold text-emerald-700 text-xs">{displayCertId}</span></div>
          <div className="text-[8px] font-mono text-slate-400 max-w-[180px] truncate">
            {digitalSignature ? `SIG: ${digitalSignature.substring(0, 18)}...` : 'Blockchain Verified'}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <div className="w-16 border-b-2 border-emerald-400 pb-0.5" />
            <span className="text-[8.5px] text-slate-500 font-semibold">Convenor / Chair</span>
          </div>
          <CertificateQRCode value={verificationUrl || `${window.location.origin}/verify/${displayCertId}`} size={58} />
        </div>
      </div>
    </div>
  );
}
