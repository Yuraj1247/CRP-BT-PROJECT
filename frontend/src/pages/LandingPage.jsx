import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Cpu, ShieldCheck, ArrowRight, Trash2, Lock, FileText } from 'lucide-react';
import { getCertificatesList, getCryptoInfo, deleteCertificate } from '../services/api';

export default function LandingPage() {
  const [recentCerts, setRecentCerts] = useState([]);
  const [cryptoInfo, setCryptoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = async () => {
    try {
      const [certsRes, infoRes] = await Promise.allSettled([
        getCertificatesList(),
        getCryptoInfo()
      ]);
      if (certsRes.status === 'fulfilled' && certsRes.value?.certificates) {
        setRecentCerts(certsRes.value.certificates.slice().reverse());
      }
      if (infoRes.status === 'fulfilled') {
        setCryptoInfo(infoRes.value);
      }
    } catch (err) {
      console.error('Error loading landing page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (certId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete certificate ${certId}?`)) {
      return;
    }

    setDeletingId(certId);
    try {
      await deleteCertificate(certId);
      setRecentCerts((prev) => prev.filter((c) => c.certificateId !== certId));
    } catch (err) {
      console.error('Failed to delete certificate:', err);
      alert('Failed to delete certificate: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-blue-100">
          <ShieldCheck className="w-4 h-4" />
          <span>Cryptographically Secured & Verified Certificates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Secure Certificate Issuance & QR Verification
        </h1>
        <p className="text-base text-slate-600 mt-3 leading-relaxed">
          Generate tamper-proof digital certificates signed with RSA-2048, encrypted with AES-256 before storage, anchored in an immutable blockchain ledger, and verifiable instantly via QR code.
        </p>
      </div>

      {/* Main 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Card 1: Issue Certificate */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Issue Certificate</h2>
            <p className="text-sm text-slate-600 mt-2">
              Generate certificates with 6 unique templates, sign with RSA, encrypt data with AES-256, and email directly to participants.
            </p>
          </div>
          <Link
            to="/create"
            className="mt-6 inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            <span>Create Certificate</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Verify Certificate */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Verify Certificate</h2>
            <p className="text-sm text-slate-600 mt-2">
              Scan the QR code via webcam, upload an image, or enter Certificate ID to verify cryptographic integrity in real time.
            </p>
          </div>
          <Link
            to="/verify"
            className="mt-6 inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
          >
            <span>Verify via QR or ID</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Cryptographic Process */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Cryptographic Process</h2>
            <p className="text-sm text-slate-600 mt-2">
              Explore the flow-wise architecture explaining how SHA-256, RSA-2048, AES-256, and Blockchain blocks operate together.
            </p>
          </div>
          <Link
            to="/process"
            className="mt-6 inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <span>View Process Flow</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Security Summary & Stats */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-12">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-blue-600" />
          Active Cryptographic Standards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 block">Storage Encryption</span>
            <span className="text-slate-600 mt-1 block">AES-256-GCM Authenticated</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 block">Digital Authenticity</span>
            <span className="text-slate-600 mt-1 block">RSA-2048 with SHA-256</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 block">Integrity Verification</span>
            <span className="text-slate-600 mt-1 block">SHA-256 Canonical Hashing</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 block">Verification Ledger</span>
            <span className="text-slate-600 mt-1 block">
              Blockchain Ledger ({cryptoInfo?.totalBlocks || 1} Blocks)
            </span>
          </div>
        </div>
      </div>

      {/* Recently Issued Certificates */}
      {recentCerts.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Recently Issued Certificates
            </h3>
            <span className="text-xs text-slate-500">Live Registry</span>
          </div>

          <div className="divide-y divide-slate-100">
            {recentCerts.map((cert) => (
              <div key={cert.certificateId} className="py-3 flex items-center justify-between text-sm hover:bg-slate-50/70 px-2 rounded-lg transition">
                <div>
                  <span className="font-semibold text-slate-800">{cert.recipientName}</span>
                  <span className="text-xs text-slate-500 block sm:inline sm:ml-2">
                    &bull; {cert.courseTitle}
                  </span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {cert.certificateId}
                  </span>
                  <Link
                    to={`/verify/${cert.certificateId}`}
                    className="text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition"
                  >
                    <span>Verify</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(cert.certificateId, e)}
                    disabled={deletingId === cert.certificateId}
                    title="Delete Certificate"
                    className="text-xs text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
