import express from 'express';
import { CertificateService } from '../services/certificateService.js';
import { getAllCertificates, deleteCertificateRecord } from '../config/firebase.js';

const router = express.Router();

/**
 * POST /api/certificates/generate
 * Generates certificate, signs with RSA, encrypts with AES, records in Blockchain, sends Nodemailer email
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      recipientName,
      recipientEmail,
      courseTitle,
      issuerName,
      issueDate,
      templateId,
      baseUrl,
      certificateImageBase64
    } = req.body;

    const result = await CertificateService.issueCertificate({
      recipientName,
      recipientEmail,
      courseTitle,
      issuerName,
      issueDate,
      templateId,
      baseUrl: baseUrl || `${req.protocol}://${req.get('host')}`,
      certificateImageBase64
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error('Certificate Generation Error:', error);
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/verify/:id
 * Verifies RSA signature, SHA-256 integrity, AES decryption, and Blockchain block
 */
router.get('/verify/:id', async (req, res) => {
  try {
    const certificateId = req.params.id;
    const result = await CertificateService.verifyCertificateById(certificateId);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Certificate Verification Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/blockchain
 * Returns all blocks and chain validation status
 */
router.get('/blockchain', (req, res) => {
  try {
    const result = CertificateService.getBlockchainLedger();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/crypto-info
 * Returns system cryptographic parameters, public key, and active algorithms
 */
router.get('/crypto-info', (req, res) => {
  try {
    const info = CertificateService.getCryptoInfo();
    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/certificates/list
 * Returns list of recent issued certificates
 */
router.get('/list', async (req, res) => {
  try {
    const list = await getAllCertificates();
    // Return summary without heavy sensitive data
    const summary = list.map(c => ({
      certificateId: c.certificateId,
      recipientName: c.recipientName,
      courseTitle: c.courseTitle,
      issuerName: c.issuerName,
      issueDate: c.issueDate,
      templateId: c.templateId,
      certificateHash: c.certificateHash,
      blockchainBlockHash: c.blockchainBlockHash,
      createdAt: c.createdAt
    }));
    return res.status(200).json({ certificates: summary });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/certificates/:id
 * Deletes certificate record from local store and Firebase Firestore
 */
router.delete('/:id', async (req, res) => {
  try {
    const certificateId = req.params.id;
    const result = await deleteCertificateRecord(certificateId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/certificates/simulate-pipeline
 * Live real-time cryptographic step simulator
 */
router.post('/simulate-pipeline', (req, res) => {
  try {
    const trace = CertificateService.simulatePipeline(req.body);
    return res.status(200).json(trace);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
