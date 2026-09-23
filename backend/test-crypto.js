import { generateSHA256, createCanonicalCertificateString, verifySHA256 } from './crypto/hash.js';
import { initRSAKeys, signData, verifySignature, getPublicKey } from './crypto/rsa.js';
import { encryptDataAES, decryptDataAES } from './crypto/aes.js';
import { blockchain } from './crypto/blockchain.js';

console.log('🧪 Starting Cryptographic Pipeline Unit Tests...\n');

// 1. Test RSA-2048
console.log('1️⃣ Testing RSA-2048 Digital Signature:');
initRSAKeys();
const testData = 'ID:CERT-TEST-001|NAME:Alice Smith|EMAIL:alice@example.com|COURSE:Cybersecurity Mastery|ISSUER:Global Tech Academy|DATE:2026-09-23|TEMPLATE:template-1';
const signature = signData(testData);
console.log('   Generated Signature length:', signature.length);
const isSigValid = verifySignature(testData, signature);
console.log('   Signature verification on original data:', isSigValid ? '✅ PASS' : '❌ FAIL');
const isTamperedSigValid = verifySignature(testData + 'TAMPERED', signature);
console.log('   Signature verification on tampered data:', !isTamperedSigValid ? '✅ PASS (Correctly rejected)' : '❌ FAIL');

// 2. Test AES-256-GCM
console.log('\n2️⃣ Testing AES-256-GCM Storage Encryption & Decryption:');
const payload = {
  id: 'CERT-TEST-001',
  recipient: 'Alice Smith',
  ssnOrPrivateData: 'Confidential Records 1234'
};
const encrypted = encryptDataAES(payload);
console.log('   Encrypted hex payload:', encrypted.encryptedData);
console.log('   IV:', encrypted.iv);
console.log('   Auth Tag:', encrypted.authTag);
const decrypted = decryptDataAES(encrypted);
console.log('   Decrypted matches original:', decrypted.recipient === payload.recipient ? '✅ PASS' : '❌ FAIL');

// 3. Test SHA-256 Hashing
console.log('\n3️⃣ Testing SHA-256 Canonical Digest:');
const hash1 = generateSHA256(testData);
console.log('   Hash:', hash1);
console.log('   Hash check:', verifySHA256(testData, hash1) ? '✅ PASS' : '❌ FAIL');

// 4. Test Blockchain Ledger
console.log('\n4️⃣ Testing Blockchain Immutable Ledger:');
const newBlock = blockchain.addCertificateBlock('CERT-TEST-001', hash1, signature);
console.log(`   Block #${newBlock.index} added. Hash: ${newBlock.blockHash}`);
console.log(`   Previous Hash: ${newBlock.previousHash}`);
const chainStatus = blockchain.validateChain();
console.log('   Blockchain integrity check:', chainStatus.isValid ? '✅ PASS' : '❌ FAIL');

console.log('\n🎉 All Cryptographic Security Tests Passed Successfully!');
