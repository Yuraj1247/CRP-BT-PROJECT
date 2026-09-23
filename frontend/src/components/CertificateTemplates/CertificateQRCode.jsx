import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function CertificateQRCode({ value, size = 64, label = "SCAN TO VERIFY" }) {
  const qrUrl = value || `${window.location.origin}/verify/DEMO`;

  return (
    <div className="flex flex-col items-center justify-center p-1.5 bg-white rounded-md border border-slate-300 shadow-sm shrink-0">
      <div className="bg-white">
        <QRCodeSVG
          value={qrUrl}
          size={size}
          level="M"
          includeMargin={false}
          bgColor="#FFFFFF"
          fgColor="#0F172A"
        />
      </div>
      {label && (
        <span className="text-[7.5px] font-mono font-bold tracking-wider text-slate-600 uppercase mt-0.5 whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
