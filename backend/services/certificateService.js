import crypto from 'crypto';
import QRCode from 'qrcode';
import { createCanonicalCertificateString, generateSHA256, verifySHA256 } from '../crypto/hash.js';
import { signData, verifySignature, getPublicKey } from '../crypto/rsa.js';
import { encryptDataAES, decryptDataAES } from '../crypto/aes.js';
import { blockchain } from '../crypto/blockchain.js';
import { saveCertificateRecord, getCertificateRecord, getAllCertificates } from '../config/firebase.js';
import { sendCertificateEmail } from './mailer.js';

function generateCertificateId() {
  const year = new Date().getFullYear();
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${year}-${randomHex}`;
}

export class CertificateService {
  /**
   * Generates, signs, encrypts, records in blockchain, and sends a certificate.
   */
  static async issueCertificate({
    recipientName,
    recipientEmail,
    courseTitle,
    issuerName,
    issueDate,
    templateId = 'template-1',
    baseUrl = 'http://localhost:5173',
    certificateImageBase64 = null
  }) {
    if (!recipientName || !courseTitle || !issuerName) {
      throw new Error('Missing required fields: recipientName, courseTitle, and issuerName are required.');
    }

    const certificateId = generateCertificateId();
    const formattedIssueDate = issueDate || new Date().toISOString().split('T')[0];

    const certificateData = {
      certificateId,
      recipientName: recipientName.trim(),
      recipientEmail: (recipientEmail || '').trim(),
      courseTitle: courseTitle.trim(),
      issuerName: issuerName.trim(),
      issueDate: formattedIssueDate,
      templateId: templateId || 'template-1',
      createdAt: new Date().toISOString()
    };

    // 1. SHA-256 Hashing: Compute canonical string & hash
    const canonicalString = createCanonicalCertificateString(certificateData);
    const certificateHash = generateSHA256(canonicalString);

    // 2. RSA Digital Signature: Sign hash using server's RSA Private Key
    const digitalSignature = signData(canonicalString);

    // 3. AES-256 Encryption: Encrypt complete certificate payload before storage
    const aesEncryptedPayload = encryptDataAES(certificateData);

    // 4. Blockchain Ledger: Append block to immutable blockchain
    const block = blockchain.addCertificateBlock(certificateId, certificateHash, digitalSignature);

    // 5. QR Code Generation: Create QR payload pointing to verification URL
    const verificationUrl = `${baseUrl.replace(/\/+$/, '')}/verify/${certificateId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 280,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    // 6. Firebase / Persistent Storage: Store encrypted payload and public verification metadata
    const record = {
      certificateId,
      recipientName: certificateData.recipientName,
      courseTitle: certificateData.courseTitle,
      issuerName: certificateData.issuerName,
      issueDate: certificateData.issueDate,
      templateId: certificateData.templateId,
      certificateHash,
      digitalSignature,
      aesEncryptedPayload, // AES encrypted package (encryptedData, iv, authTag, algorithm)
      blockchainBlockIndex: block.index,
      blockchainBlockHash: block.blockHash,
      blockchainPreviousHash: block.previousHash,
      verificationUrl,
      createdAt: certificateData.createdAt
    };

    await saveCertificateRecord(certificateId, record);

    // 7. Nodemailer: Dispatch email to recipient if email is present
    let emailStatus = { sent: false, reason: 'No email provided' };
    if (recipientEmail) {
      emailStatus = await sendCertificateEmail({
        recipientEmail,
        recipientName: certificateData.recipientName,
        courseTitle: certificateData.courseTitle,
        issuerName: certificateData.issuerName,
        certificateId,
        verificationUrl,
        issueDate: certificateData.issueDate,
        digitalSignature,
        certificateImageBase64
      });
    }

    return {
      success: true,
      certificate: {
        ...certificateData,
        certificateHash,
        digitalSignature,
        aesEncryptedPayload,
        block,
        qrCodeDataUrl,
        verificationUrl,
        emailStatus
      }
    };
  }

  /**
   * Comprehensive Certificate Verification:
   * 1. Check Blockchain Record
   * 2. Decrypt AES-256 Storage Payload
   * 3. Re-compute SHA-256 Hash and check integrity
   * 4. Verify RSA-2048 Digital Signature with Public Key
   * 5. Verify Blockchain Chain Integrity
   */
  static async verifyCertificateById(certificateId) {
    if (!certificateId) {
      throw new Error('Certificate ID is required for verification.');
    }

    const cleanId = certificateId.trim();

    // 1. Fetch from Database / Store
    const record = await getCertificateRecord(cleanId);
    if (!record) {
      return {
        isValid: false,
        error: `Certificate ID "${cleanId}" not found in repository.`,
        checks: {
          recordFound: false,
          aesDecryption: false,
          sha256Integrity: false,
          rsaSignature: false,
          blockchainIntegrity: false
        }
      };
    }

    // 2. Fetch Blockchain block
    const block = blockchain.getBlockByCertificateId(cleanId);
    const chainValidation = blockchain.validateChain();

    // 3. Decrypt AES Payload
    let decryptedData = null;
    let aesDecryptionSuccess = false;
    let decryptionError = null;

    try {
      decryptedData = decryptDataAES(record.aesEncryptedPayload);
      aesDecryptionSuccess = true;
    } catch (err) {
      decryptionError = err.message;
    }

    // 4. SHA-256 Integrity Verification
    let sha256Match = false;
    let computedHash = null;
    let canonicalString = null;

    if (decryptedData) {
      canonicalString = createCanonicalCertificateString(decryptedData);
      computedHash = generateSHA256(canonicalString);
      sha256Match = (computedHash.toLowerCase() === record.certificateHash.toLowerCase());
    }

    // 5. RSA Digital Signature Verification
    let rsaSignatureValid = false;
    if (canonicalString && record.digitalSignature) {
      rsaSignatureValid = verifySignature(canonicalString, record.digitalSignature);
    }

    // 6. Blockchain Block Check
    const blockExists = !!block;
    const blockHashMatch = block ? (block.certificateHash.toLowerCase() === record.certificateHash.toLowerCase()) : false;
    const blockchainValid = chainValidation.isValid && blockExists && blockHashMatch;

    const overallValid = aesDecryptionSuccess && sha256Match && rsaSignatureValid && blockchainValid;

    // Generate QR code for verification link
    const qrCodeDataUrl = await QRCode.toDataURL(record.verificationUrl || `http://localhost:5173/verify/${cleanId}`, {
      margin: 1,
      width: 200
    });

    return {
      isValid: overallValid,
      certificateId: cleanId,
      certificateData: decryptedData || {
        recipientName: record.recipientName,
        courseTitle: record.courseTitle,
        issuerName: record.issuerName,
        issueDate: record.issueDate,
        templateId: record.templateId
      },
      cryptography: {
        certificateHash: record.certificateHash,
        computedHash,
        digitalSignature: record.digitalSignature,
        publicKey: getPublicKey(),
        aesAlgorithm: record.aesEncryptedPayload?.algorithm || 'AES-256-GCM',
        iv: record.aesEncryptedPayload?.iv,
        authTag: record.aesEncryptedPayload?.authTag
      },
      blockchain: {
        blockIndex: block ? block.index : record.blockchainBlockIndex,
        blockHash: block ? block.blockHash : record.blockchainBlockHash,
        previousHash: block ? block.previousHash : record.blockchainPreviousHash,
        timestamp: block ? block.timestamp : null,
        chainTotalBlocks: chainValidation.totalBlocks,
        isChainIntact: chainValidation.isValid
      },
      qrCodeDataUrl,
      checks: {
        recordFound: true,
        aesDecryption: aesDecryptionSuccess,
        sha256Integrity: sha256Match,
        rsaSignature: rsaSignatureValid,
        blockchainIntegrity: blockchainValid
      },
      errors: {
        decryptionError
      }
    };
  }

  /**
   * Simulates the full step-by-step cryptographic pipeline in real-time
   * without persisting or emailing, allowing live interactive visual tracking.
   */
  static simulatePipeline({
    recipientName = '',
    courseTitle = '',
    issuerName = '',
    issueDate = '',
    certificateId = 'CERT-2026-LIVE',
    templateId = 'template-1'
  }) {
    const formattedDate = issueDate || new Date().toISOString().split('T')[0];
    const certPayload = {
      certificateId: certificateId || 'CERT-2026-LIVE',
      recipientName: (recipientName || '[Participant Name]').trim(),
      recipientEmail: 'participant@example.com',
      courseTitle: (courseTitle || '[Course Title]').trim(),
      issuerName: (issuerName || 'Veermata Jijabai Technological Institute (VJTI), Mumbai').trim(),
      issueDate: formattedDate,
      templateId
    };

    // Step 1 & 2: Canonical & SHA-256
    const canonicalString = createCanonicalCertificateString(certPayload);
    const hashDigest = generateSHA256(canonicalString);

    // Step 3: RSA Signature
    const rsaSignature = signData(canonicalString);

    // Step 4: AES-256 Encryption
    const aesPackage = encryptDataAES(certPayload);

    // Step 5: Blockchain Block simulation
    const latestBlock = blockchain.getLatestBlock();
    const simulatedBlockIndex = (latestBlock?.index || 0) + 1;
    const previousBlockHash = latestBlock?.blockHash || '0';
    const simulatedBlockHash = generateSHA256(`${simulatedBlockIndex}|${new Date().toISOString()}|${certPayload.certificateId}|${hashDigest}|${rsaSignature}|${previousBlockHash}|0`);

    return {
      rawPayload: certPayload,
      canonicalString,
      hashDigest,
      rsaSignature,
      aesPackage,
      blockchain: {
        blockIndex: simulatedBlockIndex,
        previousBlockHash,
        blockHash: simulatedBlockHash,
        timestamp: new Date().toISOString()
      },
      publicKey: getPublicKey()
    };
  }

  /**
   * Get full blockchain ledger with validation status
   */
  static getBlockchainLedger() {
    const chain = blockchain.getChain();
    const validation = blockchain.validateChain();
    return {
      chain,
      validation
    };
  }

  /**
   * Get cryptographic system info
   */
  static getCryptoInfo() {
    return {
      algorithms: {
        storageEncryption: 'AES-256-GCM (Authenticated Encryption)',
        digitalSignature: 'RSA-2048 with SHA-256 Digest',
        dataIntegrity: 'SHA-256 (256-bit Secure Hash Algorithm)',
        blockchainLedger: 'SHA-256 Chained Blocks with Previous Block Hash'
      },
      publicKey: getPublicKey(),
      totalBlocks: blockchain.getChain().length,
      isChainValid: blockchain.validateChain().isValid
    };
  }
}
