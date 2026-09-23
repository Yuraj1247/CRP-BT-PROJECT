import crypto from 'crypto';

/**
 * Creates a deterministic canonical string representation of certificate data
 * for consistent cryptographic hashing and signing.
 */
export function createCanonicalCertificateString(certData) {
  const {
    certificateId,
    recipientName,
    recipientEmail,
    courseTitle,
    issuerName,
    issueDate,
    templateId
  } = certData;

  return [
    `ID:${(certificateId || '').trim()}`,
    `NAME:${(recipientName || '').trim()}`,
    `EMAIL:${(recipientEmail || '').trim().toLowerCase()}`,
    `COURSE:${(courseTitle || '').trim()}`,
    `ISSUER:${(issuerName || '').trim()}`,
    `DATE:${(issueDate || '').trim()}`,
    `TEMPLATE:${(templateId || 'template-1').trim()}`
  ].join('|');
}

/**
 * Computes SHA-256 hash of a string or object.
 * Returns 64-character lowercase hex string.
 */
export function generateSHA256(data) {
  const input = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

/**
 * Verifies if a given data matches an expected SHA-256 hash.
 */
export function verifySHA256(data, expectedHash) {
  const calculatedHash = generateSHA256(data);
  return calculatedHash.toLowerCase() === expectedHash.toLowerCase();
}
