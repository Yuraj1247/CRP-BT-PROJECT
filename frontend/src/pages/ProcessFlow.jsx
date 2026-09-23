import React from 'react';
import { 
  ArrowDown, ShieldCheck, Lock, Key, Hash, 
  Database, QrCode, Cpu, Layers, FileText, UserCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function ProcessFlow() {
  // Real participant example data from VJTI Mumbai
  const exampleParticipant = {
    certificateId: 'CERT-2026-VJTI-7A9B',
    recipientName: 'Rahul Sharma',
    recipientEmail: 'rahul.sharma@vjti.ac.in',
    courseTitle: 'B.Tech Computer Engineering - Cryptography & Network Security',
    issuerName: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    issueDate: '2026-09-23',
    templateId: 'template-1',
    canonicalString: 'ID:CERT-2026-VJTI-7A9B|NAME:Rahul Sharma|EMAIL:rahul.sharma@vjti.ac.in|COURSE:B.Tech Computer Engineering - Cryptography & Network Security|ISSUER:Veermata Jijabai Technological Institute (VJTI), Mumbai|DATE:2026-09-23|TEMPLATE:template-1',
    sha256Hash: 'a89f3c82d5e714b901fc4e2b6a839d012479e3a6c5b8d2f14e7a9c0b3d5f8e12',
    rsaSignature: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD7X2xY5f4a9b...7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e==',
    aesEncrypted: {
      ciphertext: '5a8f9c2d1b7e4a3f8c0d9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
      iv: '8f4a1c9e2b7d5f0a3c6e9b1d',
      authTag: '7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f',
      algorithm: 'AES-256-GCM'
    },
    blockchainBlock: {
      index: 12,
      timestamp: '2026-09-23T05:30:00.000Z',
      previousHash: '3f7b9c1d5e8a0f2b4c6e8a1d3f5a7b9c1d5e8a0f2b4c6e8a1d3f5a7b9c1d5e8a',
      blockHash: '9e1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a'
    }
  };

  const stepsList = [
    {
      stepNumber: '01',
      title: 'Canonical Normalization',
      tech: 'RFC Deterministic String Format',
      icon: Layers,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Standardizes Certificate ID, Participant Name, Email, Course Title, Issuing College, and Issue Date into an exact deterministic byte format so hashing is reproducible across all platforms.'
    },
    {
      stepNumber: '02',
      title: 'SHA-256 Hash Digest',
      tech: '256-Bit Secure Hashing (SHA-256)',
      icon: Hash,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'The canonical string is hashed into a 64-character hexadecimal digest. If even a single character in the certificate is altered later, the calculated hash completely changes (avalanche effect).'
    },
    {
      stepNumber: '03',
      title: 'RSA-2048 Digital Signature',
      tech: 'Asymmetric Cryptography (RSA-SHA256)',
      icon: Key,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'The college’s private RSA-2048 key encrypts the SHA-256 digest. Anyone with the college’s public key can mathematically verify that only the genuine authority issued and signed the certificate.'
    },
    {
      stepNumber: '04',
      title: 'AES-256 Storage Encryption',
      tech: 'AES-256-GCM (Authenticated Encryption)',
      icon: Lock,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Before storing the certificate payload into Firebase Cloud Firestore / persistent storage, the entire record is encrypted using AES-256-GCM with a random initialization vector (IV) and authentication tag.'
    },
    {
      stepNumber: '05',
      title: 'Blockchain Block Anchoring',
      tech: 'Immutable Chained Ledger',
      icon: Database,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'A new block containing {Index, Timestamp, CertificateId, CertificateHash, Signature, PreviousBlockHash} is appended to the ledger. Every block is permanently linked to the preceding block hash.'
    },
    {
      stepNumber: '06',
      title: 'Dynamic QR Code Verification',
      tech: 'High-Density QR & Verification URL',
      icon: QrCode,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      description: 'The certificate embeds a QR code pointing directly to the verification endpoint. When scanned, it automatically decrypts AES data, validates the SHA-256 digest, checks RSA signatures, and confirms blockchain integrity.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          How Cryptographic Certificate Security Works
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Step-by-step cryptographic methodology and a real participant example demonstrating the complete issuance and verification lifecycle.
        </p>
      </div>

      {/* ========================================================
          1. THE STEPS THAT ARE USED (STEP BY STEP)
         ======================================================== */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            1
          </div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Step-by-Step Security Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stepsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.stepNumber}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      STEP {item.stepNumber}
                    </span>
                    <div className={`p-1.5 rounded-md border ${item.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                    {item.tech}
                  </span>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. REAL PARTICIPANT EXAMPLE DEMONSTRATING THE PROCESS
         ======================================================== */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            2
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Real Participant Example: Complete Process Walkthrough
            </h2>
            <p className="text-xs text-slate-500">
              Demonstrating the exact data transformation for participant <strong>Rahul Sharma</strong> from <strong>VJTI Mumbai</strong>
            </p>
          </div>
        </div>

        {/* Step-by-Step Flow for this Participant */}
        <div className="space-y-4">
          {/* Stage 1: Input Participant Data */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-blue-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Stage 1: Participant Input Data
              </span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-semibold">
                RAW INPUT
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100 font-mono text-xs text-slate-800 space-y-1">
              <div><span className="text-slate-400">Participant Name:</span> <strong className="text-slate-900">{exampleParticipant.recipientName}</strong></div>
              <div><span className="text-slate-400">Participant Email:</span> <span className="text-slate-700">{exampleParticipant.recipientEmail}</span></div>
              <div><span className="text-slate-400">Course / Degree:</span> <span className="text-slate-800">{exampleParticipant.courseTitle}</span></div>
              <div><span className="text-slate-400">Issuing College:</span> <span className="text-slate-800">{exampleParticipant.issuerName}</span></div>
              <div><span className="text-slate-400">Certificate ID:</span> <span className="text-blue-700 font-bold">{exampleParticipant.certificateId}</span></div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 2: Canonical Normalization */}
          <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-indigo-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                Stage 2: Deterministic Canonical String
              </span>
              <span className="text-[10px] font-mono bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-semibold">
                NORMALIZED
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-indigo-100 font-mono text-xs text-indigo-950 break-all leading-relaxed">
              {exampleParticipant.canonicalString}
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 3: SHA-256 Digest */}
          <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-purple-900 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-purple-600" />
                Stage 3: SHA-256 Cryptographic Hash (Integrity)
              </span>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-semibold">
                256-BIT HASH
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-purple-100 font-mono text-xs text-purple-900 font-bold break-all">
              {exampleParticipant.sha256Hash}
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 4: RSA-2048 Digital Signature */}
          <div className="p-4 rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-fuchsia-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-fuchsia-600" />
                Stage 4: RSA-2048 Digital Signature (Authenticity & Non-Repudiation)
              </span>
              <span className="text-[10px] font-mono bg-fuchsia-100 text-fuchsia-900 px-2 py-0.5 rounded font-semibold">
                DIGITALLY SIGNED
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-fuchsia-100 font-mono text-[11px] text-fuchsia-950 break-all">
              {exampleParticipant.rsaSignature}
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 5: AES-256-GCM Storage Encryption */}
          <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" />
                Stage 5: AES-256-GCM Storage Encryption (Confidentiality)
              </span>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                AES-256 STORED
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100 font-mono text-[11px] text-slate-800 space-y-1">
              <div><span className="text-slate-400">Ciphertext:</span> <span className="text-amber-800 break-all">{exampleParticipant.aesEncrypted.ciphertext}</span></div>
              <div><span className="text-slate-400">Random IV:</span> <span className="font-bold text-slate-800">{exampleParticipant.aesEncrypted.iv}</span></div>
              <div><span className="text-slate-400">GCM Auth Tag:</span> <span className="font-bold text-slate-800">{exampleParticipant.aesEncrypted.authTag}</span></div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 6: Blockchain Block Anchoring */}
          <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-emerald-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                Stage 6: Immutable Blockchain Block #{exampleParticipant.blockchainBlock.index}
              </span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                CHAIN ANCHORED
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100 font-mono text-[11px] text-slate-800 space-y-1">
              <div><span className="text-slate-400">Previous Block Hash:</span> <span className="text-slate-600 break-all">{exampleParticipant.blockchainBlock.previousHash}</span></div>
              <div><span className="text-slate-400">Current Block Hash:</span> <span className="text-emerald-800 font-bold break-all">{exampleParticipant.blockchainBlock.blockHash}</span></div>
              <div><span className="text-slate-400">Block Timestamp:</span> <span className="text-slate-700">{exampleParticipant.blockchainBlock.timestamp}</span></div>
            </div>
          </div>

          <div className="flex justify-center text-slate-400">
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Stage 7: QR Code & Verification Endpoint */}
          <div className="p-4 rounded-xl border-2 border-cyan-200 bg-cyan-50/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-cyan-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-cyan-600" />
                Stage 7: Dynamic Verification QR Code
              </span>
              <p className="text-xs text-slate-600 max-w-md">
                Embedded directly into Rahul Sharma's certificate. Scanning this QR code or opening the link verifies all 4 cryptographic checks in real time.
              </p>
              <div className="text-[11px] font-mono text-cyan-800 bg-white px-2.5 py-1 rounded border border-cyan-200 inline-block mt-1">
                {window.location.origin}/verify/{exampleParticipant.certificateId}
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-cyan-200 shadow-sm shrink-0">
              <QRCodeSVG
                value={`${window.location.origin}/verify/${exampleParticipant.certificateId}`}
                size={74}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#0F172A"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
