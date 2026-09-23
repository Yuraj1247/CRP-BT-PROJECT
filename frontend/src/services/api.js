import axios from 'axios';

const API_BASE = '/api/certificates';

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
