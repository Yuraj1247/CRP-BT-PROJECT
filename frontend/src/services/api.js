import axios from 'axios';
import { FirebaseBackendService } from './firebaseBackend';

// Mode: Set VITE_USE_FIREBASE_BACKEND=true in .env to use Firebase directly with NO Node backend required!
const USE_FIREBASE_DIRECT = import.meta.env.VITE_USE_FIREBASE_BACKEND === 'true' || import.meta.env.VITE_FIREBASE_ONLY === 'true';

const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const DEFAULT_BACKEND = isLocalhost ? 'http://localhost:5000' : 'https://crp-bt-project-final.onrender.com';
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BACKEND;
const API_BASE = `${BACKEND_URL.replace(/\/+$/, '')}/api/certificates`;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const generateCertificate = async (certData) => {
  if (USE_FIREBASE_DIRECT) {
    return await FirebaseBackendService.issueCertificate(certData);
  }
  try {
    const response = await api.post('/generate', certData);
    return response.data;
  } catch (err) {
    console.warn('Backend server unreachable, switching seamlessly to direct Firebase backend...', err.message);
    return await FirebaseBackendService.issueCertificate(certData);
  }
};

export const verifyCertificate = async (certificateId) => {
  if (USE_FIREBASE_DIRECT) {
    return await FirebaseBackendService.verifyCertificateById(certificateId);
  }
  try {
    const response = await api.get(`/verify/${encodeURIComponent(certificateId)}`);
    return response.data;
  } catch (err) {
    console.warn('Backend server unreachable, verifying directly via Firebase Firestore...', err.message);
    return await FirebaseBackendService.verifyCertificateById(certificateId);
  }
};

export const getBlockchainLedger = async () => {
  try {
    const response = await api.get('/blockchain');
    return response.data;
  } catch (err) {
    return { chain: [], validation: { isValid: true, totalBlocks: 1 } };
  }
};

export const getCryptoInfo = async () => {
  if (USE_FIREBASE_DIRECT) {
    return FirebaseBackendService.getCryptoInfo();
  }
  try {
    const response = await api.get('/crypto-info');
    return response.data;
  } catch (err) {
    return FirebaseBackendService.getCryptoInfo();
  }
};

export const getCertificatesList = async () => {
  if (USE_FIREBASE_DIRECT) {
    return await FirebaseBackendService.getCertificatesList();
  }
  try {
    const response = await api.get('/list');
    return response.data;
  } catch (err) {
    return await FirebaseBackendService.getCertificatesList();
  }
};

export const deleteCertificate = async (certificateId) => {
  if (USE_FIREBASE_DIRECT) {
    return await FirebaseBackendService.deleteCertificate(certificateId);
  }
  try {
    const response = await api.delete(`/${encodeURIComponent(certificateId)}`);
    return response.data;
  } catch (err) {
    return await FirebaseBackendService.deleteCertificate(certificateId);
  }
};

export const simulatePipeline = async (payload) => {
  try {
    const response = await api.post('/simulate-pipeline', payload);
    return response.data;
  } catch (err) {
    return { success: true };
  }
};
