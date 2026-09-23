import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ShieldCheck, ShieldAlert, Search, Camera, Upload, 
  CheckCircle2, XCircle, Lock, Hash, Link2, RefreshCw, Download, FileText
} from 'lucide-react';
import { verifyCertificate } from '../services/api';
import CertificateRenderer from '../components/CertificateTemplates';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function VerifyCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isScanningCamera, setIsScanningCamera] = useState(false);

  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const certPrintRef = useRef(null);

  useEffect(() => {
    if (id) {
      setSearchId(id);
      runVerification(id);
    }
  }, [id]);

  const runVerification = async (certId) => {
    if (!certId || !certId.trim()) {
      setError('Please provide a valid Certificate ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyCertificate(certId.trim());
      setResult(data);
      if (!data.isValid && data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to verify certificate.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim()}`, { replace: true });
      runVerification(searchId.trim());
    }
  };

  // Camera QR Scanner
  const startCameraScanner = async () => {
    setIsScanningCamera(true);
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      qrScannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Stop camera on successful scan
          stopCameraScanner();
          // Extract Certificate ID from decoded URL or text
          let scannedId = decodedText;
          if (decodedText.includes('/verify/')) {
            const parts = decodedText.split('/verify/');
            scannedId = parts[1]?.split('?')[0]?.split('/')[0] || decodedText;
          }
          setSearchId(scannedId);
          navigate(`/verify/${scannedId}`, { replace: true });
          runVerification(scannedId);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera QR Scan Error:', err);
      setError('Could not access camera or start scanner.');
      setIsScanningCamera(false);
    }
  };

  const stopCameraScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop().then(() => {
        qrScannerRef.current.clear();
        qrScannerRef.current = null;
        setIsScanningCamera(false);
      }).catch(() => {
        setIsScanningCamera(false);
      });
    } else {
      setIsScanningCamera(false);
    }
  };

  // File Upload QR Scanner
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-file-scanner-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      let scannedId = decodedText;
      if (decodedText.includes('/verify/')) {
        const parts = decodedText.split('/verify/');
        scannedId = parts[1]?.split('?')[0]?.split('/')[0] || decodedText;
      }
      setSearchId(scannedId);
      navigate(`/verify/${scannedId}`, { replace: true });
      runVerification(scannedId);
    } catch (err) {
      console.warn('QR decode from file failed:', err);
      setError('No readable QR code found in the uploaded image. Try entering the Certificate ID manually.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadPDF = async () => {
    if (!certPrintRef.current) return;
    try {
      const canvas = await html2canvas(certPrintRef.current, { scale: 3 });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${result.certificateId}_verified.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden container for file scan */}
      <div id="qr-file-scanner-temp" className="hidden" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Verify Certificate Authenticity
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Scan the certificate QR code or enter the Certificate ID to verify cryptographic authenticity and blockchain anchoring.
        </p>
      </div>

      {/* Input Options Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. CERT-2026-ABCD1234)"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Verify</span>
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <button
            type="button"
            onClick={isScanningCamera ? stopCameraScanner : startCameraScanner}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 font-medium transition ${
              isScanningCamera
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isScanningCamera ? 'Stop Camera Scanner' : 'Scan via Webcam'}</span>
          </button>

          <label className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium cursor-pointer flex items-center space-x-1.5 transition">
            <Upload className="w-4 h-4" />
            <span>Upload Certificate / QR Image</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Live Camera Scanner Box */}
        {isScanningCamera && (
          <div className="mt-4 p-4 bg-slate-900 rounded-xl flex flex-col items-center">
            <div id="qr-reader-container" className="w-full max-w-[320px] rounded-lg overflow-hidden" />
            <p className="text-xs text-slate-300 mt-2">Point your camera at the Certificate QR code</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && !result && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-3 max-w-3xl mx-auto mb-8">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">Verification Failed</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Verification Result Section */}
      {result && (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
          {/* Main Status Banner */}
          <div
            className={`p-6 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              result.isValid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                  result.isValid ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              >
                {result.isValid ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7" />}
              </div>
              <div>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    result.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.isValid ? 'Cryptographically Verified' : 'Verification Compromised'}
                </span>
                <h2 className="text-xl font-bold mt-1">
                  {result.isValid
                    ? 'Certificate is Authentic & Valid'
                    : 'Certificate Data Tampered or Not Found'}
                </h2>
                <p className="text-xs opacity-80 font-mono mt-0.5">
                  ID: {result.certificateId}
                </p>
              </div>
            </div>

            {result.isValid && (
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Verified Copy</span>
              </button>
            )}
          </div>

          {/* 4 Multi-Layer Cryptographic Security Checks */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Cryptographic Integrity Audit (4 Verification Gates)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check 1: Record & AES Decryption */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">1. AES-256 Storage Decryption</span>
                  {result.checks?.aesDecryption ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Decrypted
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                      <XCircle className="w-4 h-4" /> Failed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  AES-256-GCM authenticated payload was retrieved from encrypted storage and decrypted successfully.
                </p>
                <div className="text-[10px] font-mono text-slate-400 mt-2 truncate">
                  IV: {result.cryptography?.iv || 'N/A'}
                </div>
              </div>

              {/* Check 2: SHA-256 Digest */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">2. SHA-256 Data Integrity</span>
                  {result.checks?.sha256Integrity ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Hash Match
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                      <XCircle className="w-4 h-4" /> Mismatch
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Computed hash of canonical certificate attributes matches the stored digest bit-for-bit.
                </p>
                <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                  Hash: {result.cryptography?.certificateHash}
                </div>
              </div>

              {/* Check 3: RSA Digital Signature */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">3. RSA-2048 Digital Signature</span>
                  {result.checks?.rsaSignature ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Valid Signature
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                      <XCircle className="w-4 h-4" /> Invalid
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Digital signature verified with Authority RSA Public Key. Confirms authenticity & non-repudiation.
                </p>
                <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                  Sig: {result.cryptography?.digitalSignature?.substring(0, 32)}...
                </div>
              </div>

              {/* Check 4: Blockchain Ledger */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">4. Blockchain Verification Block</span>
                  {result.checks?.blockchainIntegrity ? (
                    <span className="flex items-center text-xs font-bold text-emerald-600 gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Block #{result.blockchain?.blockIndex} Intact
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-red-600 gap-1">
                      <XCircle className="w-4 h-4" /> Unverified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">
                  Anchored into the immutable chain. Block hash is chained to previous block without tampering.
                </p>
                <div className="text-[10px] font-mono text-slate-500 mt-2 truncate">
                  Block Hash: {result.blockchain?.blockHash}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Visual Presentation */}
          {result.isValid && result.certificateData && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Verified Certificate Document
              </h3>

              <div className="w-full bg-slate-100 p-4 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
                <div className="w-full max-w-[720px]">
                  <CertificateRenderer
                    innerRef={certPrintRef}
                    templateId={result.certificateData.templateId || 'template-1'}
                    data={{
                      ...result.certificateData,
                      certificateId: result.certificateId,
                      digitalSignature: result.cryptography?.digitalSignature,
                      certificateHash: result.cryptography?.certificateHash,
                      verificationUrl: window.location.href
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
