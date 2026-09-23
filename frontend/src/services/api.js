import axios from 'axios';

// Automatically detect environment: use local backend during local development, or Render URL in production
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const DEFAULT_BACKEND = isLocalhost ? 'http://localhost:5000' : 'https://crp-bt-project-final.onrender.com';
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND;
const API_BASE = `${BACKEND_URL.replace(/\/+$/, '')}/api/certificates`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const generateCertificate = async (certData) => {
  const response = await api.post('/generate', certData);
  return response.data;
};

export const verifyCertificate = async (certificateId) => {
  const response = await api.get(`/verify/${encodeURIComponent(certificateId)}`);
  return response.data;
};

export const getBlockchainLedger = async () => {
  const response = await api.get('/blockchain');
  return response.data;
};

export const getCryptoInfo = async () => {
  const response = await api.get('/crypto-info');
  return response.data;
};

export const getCertificatesList = async () => {
  const response = await api.get('/list');
  return response.data;
};

export const deleteCertificate = async (certificateId) => {
  const response = await api.delete(`/${encodeURIComponent(certificateId)}`);
  return response.data;
};

export const simulatePipeline = async (payload) => {
  const response = await api.post('/simulate-pipeline', payload);
  return response.data;
};
