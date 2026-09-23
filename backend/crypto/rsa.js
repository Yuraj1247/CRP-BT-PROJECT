import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KEYS_DIR = path.join(__dirname, '..', 'keys');

let privateKeyPem = null;
let publicKeyPem = null;

/**
 * Initialize RSA-2048 Keypair.
 * If saved in keys directory, load it; otherwise generate fresh RSA-2048 keys.
 */
export function initRSAKeys() {
  try {
    if (!fs.existsSync(KEYS_DIR)) {
      fs.mkdirSync(KEYS_DIR, { recursive: true });
    }

    const privPath = path.join(KEYS_DIR, 'private_key.pem');
    const pubPath = path.join(KEYS_DIR, 'public_key.pem');

    if (fs.existsSync(privPath) && fs.existsSync(pubPath)) {
      privateKeyPem = fs.readFileSync(privPath, 'utf8');
      publicKeyPem = fs.readFileSync(pubPath, 'utf8');
      console.log('✅ Loaded existing RSA-2048 Keypair.');
      return { publicKeyPem, privateKeyPem };
    }

    console.log('🔑 Generating new RSA-2048 Keypair...');
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    privateKeyPem = privateKey;
    publicKeyPem = publicKey;

    fs.writeFileSync(privPath, privateKey, { encoding: 'utf8', mode: 0o600 });
    fs.writeFileSync(pubPath, publicKey, { encoding: 'utf8', mode: 0o644 });
    console.log('✅ RSA-2048 Keypair generated & saved to /backend/keys');
    return { publicKeyPem, privateKeyPem };
  } catch (error) {
    console.error('Error initializing RSA keys:', error);
    throw error;
  }
}

/**
 * Digitally sign a data string with the RSA private key using SHA-256 digest.
 * Returns signature in Base64 encoding.
 */
export function signData(dataString) {
  if (!privateKeyPem) initRSAKeys();
  const sign = crypto.createSign('SHA256');
  sign.update(dataString);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
}

/**
 * Verify an RSA-SHA256 digital signature against data string using public key.
 * Returns boolean.
 */
export function verifySignature(dataString, signatureBase64, customPublicKeyPem = null) {
  try {
    const pubKey = customPublicKeyPem || publicKeyPem || initRSAKeys().publicKeyPem;
    const verify = crypto.createVerify('SHA256');
    verify.update(dataString);
    verify.end();
    return verify.verify(pubKey, signatureBase64, 'base64');
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Get public key in PEM format.
 */
export function getPublicKey() {
  if (!publicKeyPem) initRSAKeys();
  return publicKeyPem;
}
