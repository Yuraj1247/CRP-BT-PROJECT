# 🛡️ CertShield: Secure Certificate Issuance & QR Verification Platform

A full-stack, cryptographically fortified web application for generating, digitally signing, encrypting before storage, and instantly verifying digital certificates via QR Code.

Built with **ReactJS** (Frontend), **ExpressJS** & **Firebase Spark Free Plan** (Backend), **Nodemailer** for automated email delivery, and a multi-layered security architecture (**AES-256-GCM**, **RSA-2048**, **SHA-256**, and an **Immutable Blockchain Ledger**).

---

## ✨ Key Features & Cryptographic Architecture

1. **SHA-256 Integrity Verification**: Standardized canonical formatting and 256-bit hashing ensure bit-for-bit tamper detection.
2. **RSA-2048 Digital Signatures**: Certificates are signed with the issuing authority's private key (`RSA-SHA256`) and verifiable publicly.
3. **AES-256-GCM Encrypted Storage**: All sensitive certificate records are encrypted before being stored in Firebase Spark / local persistent storage.
4. **Blockchain-Inspired Verification Ledger**: Every certificate transaction is anchored in an immutable chain of blocks linked by `previousHash` and `blockHash`.
5. **Interactive QR Code Verification**: Each certificate embeds a dynamic QR code that verifiers can scan via webcam, upload as an image, or look up by Certificate ID.
6. **6 Distinct Certificate Templates**:
   - 🎓 **Classic Academic**: Traditional dual ornate border with heraldic seal.
   - ⚡ **Modern Minimalist**: Crisp Swiss layout with cobalt accents.
   - 👑 **Gold Executive**: Prestigious navy and metallic gold palette with gilded crest.
   - 🎨 **Creative Studio**: Vibrant emerald and teal border for workshops & design.
   - 🔐 **Cyber & Tech**: High-tech badge with live SHA-256 hash snippets.
   - 📜 **Formal Vintage Heritage**: Warm ivory finish with deep burgundy framing.
7. **Nodemailer Email Dispatch**: Automatically dispatches confirmation email with attached certificate to the recipient using `ADMIN_EMAIL` and `ADMIN_APP_PASSWORD`.
8. **Simple & Light UI**: Fast, uncluttered, light-themed interface designed for clarity and efficiency.

---

## 🧭 Routes & Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Landing Page** | Clean, light-themed entry point with quick access to issuance, verification, and live recent records. |
| `/create` | **Issue Certificate** | Form input, real-time live preview of all 6 templates, instant PDF/PNG download, and email dispatch status. |
| `/verify` / `/verify/:id` | **Verify Certificate** | Scan via webcam, upload certificate image, or enter Certificate ID to run 4 cryptographic verification gates. |
| `/process` | **Cryptographic Process** | Interactive visual step-by-step pipeline detailing the encryption, signing, and blockchain anchoring workflows. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend `.env`
In `backend/.env`:
```env
PORT=5000

# Nodemailer Configuration (for participant email delivery)
ADMIN_EMAIL=your_admin_email@gmail.com
ADMIN_APP_PASSWORD=your_gmail_app_password

# AES Encryption Master Key
AES_SECRET_KEY=e4d9b28a7c1f03e659b8a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2

# Firebase Spark (Free Plan) Configuration
FIREBASE_PROJECT_ID=cert-secure-spark-demo
# FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

> **Gmail App Password Note**: To send emails with Gmail, enable 2-Step Verification in your Google Account and generate an **App Password** under Security > App Passwords.

### 3. Run Backend Server
```bash
cd backend
npm run dev
```
*The backend starts at `http://localhost:5000` and automatically generates RSA keys if not already present.*

### 4. Run Frontend App
```bash
cd frontend
npm run dev
```
*The React app starts at `http://localhost:5173`.*

---

## 🧪 Testing the Cryptographic Pipeline
To run standalone unit tests verifying RSA-2048 signing, AES-256-GCM encryption/decryption, SHA-256 hashing, and Blockchain ledger integrity:
```bash
cd backend
npm run test:crypto
```
