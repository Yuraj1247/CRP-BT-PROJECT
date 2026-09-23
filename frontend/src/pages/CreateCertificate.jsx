import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Download, CheckCircle2, AlertCircle, 
  Mail, ArrowRight, RefreshCw, Eye, Lock, Building2
} from 'lucide-react';
import CertificateRenderer, { TEMPLATES_CONFIG } from '../components/CertificateTemplates';
import { generateCertificate } from '../services/api';
import { INDIAN_INSTITUTES_PRESETS } from '../data/indianInstitutes';

export default function CreateCertificate() {
  const [formData, setFormData] = useState({
    recipientName: '',
    recipientEmail: '',
    courseTitle: 'B.Tech Computer Engineering - Cryptography & Network Security',
    issuerName: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    issueDate: new Date().toISOString().split('T')[0],
    templateId: 'template-1'
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [error, setError] = useState(null);

  const certPreviewRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (templateId) => {
    setFormData((prev) => ({ ...prev, templateId }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      issuerName: preset.issuerName,
      courseTitle: preset.courseTitle,
      templateId: preset.templateId
    }));
  };

  const captureCertificateImage = async () => {
    if (!certPreviewRef.current) return null;
    try {
      const canvas = await html2canvas(certPreviewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.warn('Canvas capture warning:', err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.recipientName.trim()) {
      setError('Please enter the Participant / Recipient Name.');
      return;
    }
    if (!formData.recipientEmail.trim()) {
      setError('Please enter the Participant Email to receive the certificate.');
      return;
    }
    if (!formData.courseTitle.trim() || !formData.issuerName.trim()) {
      setError('Please enter Course / Program title and Issuing Institution.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep(1);

    try {
      // Step 1: Capture Preview
      const imageBase64 = await captureCertificateImage();
      setCurrentStep(2);

      // Step 2 & 3: Send to Backend for Hashing, RSA Signing, AES Encryption, Blockchain, Email
      const response = await generateCertificate({
        ...formData,
        baseUrl: window.location.origin,
        certificateImageBase64: imageBase64
      });

      setCurrentStep(3);

      if (response.success) {
        setGeneratedResult(response.certificate);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      } else {
        throw new Error(response.error || 'Failed to generate certificate');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Error creating certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certPreviewRef.current) return;
    try {
      const canvas = await html2canvas(certPreviewRef.current, {
        scale: 3,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${generatedResult?.certificateId || 'certificate'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };

  const handleDownloadPNG = async () => {
    if (!certPreviewRef.current) return;
    try {
      const canvas = await html2canvas(certPreviewRef.current, {
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `${generatedResult?.certificateId || 'certificate'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('PNG export error:', err);
    }
  };

  // Preview data combining live user form inputs and generated cryptographic fields
  const previewData = {
    ...formData,
    certificateId: generatedResult?.certificateId || '',
    digitalSignature: generatedResult?.digitalSignature || '',
    certificateHash: generatedResult?.certificateHash || '',
    verificationUrl: generatedResult?.verificationUrl || ''
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Issue Digital Certificate
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Enter real participant information, choose your institution template, and issue an RSA-2048 signed & AES-256 encrypted certificate with verifiable QR code.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Success Banner */}
      {generatedResult && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-base">
                  Certificate Issued & Cryptographically Recorded!
                </h3>
                <p className="text-xs text-emerald-800 font-mono mt-0.5">
                  ID: <span className="font-bold">{generatedResult.certificateId}</span> &bull; Block #{generatedResult.block?.index}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleDownloadPNG}
                className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <Link
                to={`/verify/${generatedResult.certificateId}`}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
              >
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Email delivery summary */}
          <div className="mt-4 pt-3 border-t border-emerald-200/80 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-emerald-700" />
              <span>
                <strong>Email Delivery:</strong>{' '}
                {generatedResult.emailStatus?.sent
                  ? `Delivered to ${formData.recipientEmail}`
                  : `Simulated. (To send real emails, set ADMIN_EMAIL and ADMIN_APP_PASSWORD in backend/.env)`}
              </span>
            </div>
            <button
              onClick={() => setGeneratedResult(null)}
              className="text-xs text-emerald-800 underline hover:text-emerald-950 font-medium"
            >
              Issue Another Certificate
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Form (Left) & Real-Time Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Real Indian Institute Presets */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Indian Institute Presets (Quick Fill)
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INDIAN_INSTITUTES_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  {preset.label.split(' - ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Template Selector */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Select Certificate Style (6 Templates)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATES_CONFIG.map((t) => {
                const isSelected = formData.templateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTemplateSelect(t.id)}
                    className={`p-2 text-left rounded-lg border text-xs transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-800 block truncate text-xs">{t.name}</span>
                      <span className="text-[9px] text-slate-500 block truncate mt-0.5">{t.category}</span>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 self-end mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              Certificate Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Participant / Recipient Name *
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Enter participant full name (e.g. Rahul Sharma)"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Participant Email (Receiving Email Address) *
              </label>
              <input
                type="email"
                name="recipientEmail"
                value={formData.recipientEmail}
                onChange={handleChange}
                placeholder="participant.real.email@gmail.com"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The certificate image & verification details will be emailed directly to this participant address.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Program / Achievement Title *
              </label>
              <input
                type="text"
                name="courseTitle"
                value={formData.courseTitle}
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Engineering - Cryptography"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issuing College / Organization *
                </label>
                <input
                  type="text"
                  name="issuerName"
                  value={formData.issuerName}
                  onChange={handleChange}
                  placeholder="e.g. VJTI Mumbai"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {currentStep === 1 && 'Rendering Certificate...'}
                      {currentStep === 2 && 'Signing RSA & Encrypting AES...'}
                      {currentStep === 3 && 'Recording in Blockchain & Emailing...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Generate, Sign & Encrypt Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive Certificate Live Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Real-Time Certificate Preview & QR Code</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Template: {TEMPLATES_CONFIG.find(t => t.id === formData.templateId)?.name}
            </span>
          </div>

          {/* Certificate Display */}
          <div className="w-full bg-slate-100 p-2 sm:p-4 rounded-xl border border-slate-200 overflow-x-auto flex justify-center">
            <div className="w-full max-w-[760px]">
              <CertificateRenderer
                innerRef={certPreviewRef}
                templateId={formData.templateId}
                data={previewData}
              />
            </div>
          </div>
          
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            * The QR code is calibrated and links directly to the verified certificate record.
          </p>
        </div>
      </div>
    </div>
  );
}
