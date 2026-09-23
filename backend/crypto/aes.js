import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Standard 32-byte (256-bit) encryption key
const DEFAULT_FALLBACK_KEY = 'a8f94d21e8b7c653198a2d3f4e5b6c7a8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a';

function getAESKey() {
  const envKey = process.env.AES_SECRET_KEY;
  if (envKey) {
    // Ensure key is 32 bytes
    return crypto.createHash('sha256').update(envKey).digest();
  }
  return Buffer.from(DEFAULT_FALLBACK_KEY, 'hex');
}

/**
 * Encrypt data using AES-256-GCM (Authenticated Encryption).
 * @param {Object|string} data - Raw data payload to encrypt.
 * @returns {Object} { encryptedData, iv, authTag, algorithm } in hex format.
 */
export function encryptDataAES(data) {
  try {
    const key = getAESKey();
    const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const stringData = typeof data === 'string' ? data : JSON.stringify(data);
    let encrypted = cipher.update(stringData, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag,
      algorithm: 'AES-256-GCM'
    };
  } catch (error) {
    console.error('AES Encryption Error:', error);
    throw new Error('Failed to encrypt certificate data using AES-256-GCM');
  }
}

/**
 * Decrypt AES-256-GCM encrypted payload.
 * @param {Object} encryptedPackage - { encryptedData, iv, authTag }
 * @returns {Object|string} Decrypted original payload.
 */
export function decryptDataAES(encryptedPackage) {
  try {
    const { encryptedData, iv, authTag } = encryptedPackage;
    if (!encryptedData || !iv || !authTag) {
      throw new Error('Invalid encrypted package format. iv, authTag, and encryptedData are required.');
    }

    const key = getAESKey();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('AES Decryption Error:', error);
    throw new Error('Decryption failed: integrity compromised or incorrect key/authTag');
  }
}
