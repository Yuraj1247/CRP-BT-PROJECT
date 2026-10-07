import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'certificates.json');

let db = null;
let isFirebaseConnected = false;

// Ensure local data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Local storage helper
function getLocalStore() {
  if (fs.existsSync(LOCAL_STORE_FILE)) {
    try {
      const data = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return {};
}

function saveLocalStore(store) {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write to local certificate store:', err);
  }
}

/**
 * Initialize Firebase Admin SDK for Firebase Spark Free Plan.
 */
export function initFirebase() {
  if (admin.apps.length > 0) {
    db = admin.firestore();
    isFirebaseConnected = true;
    return db;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
      ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      : path.join(__dirname, '..', 'serviceAccountKey.json');

    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountRaw) {
      const serviceAccount = JSON.parse(serviceAccountRaw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      db = admin.firestore();
      isFirebaseConnected = true;
      console.log('🔥 Connected to Firebase Firestore (Spark Plan) via ENV Service Account.');
    } else if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      isFirebaseConnected = true;
      console.log('🔥 Connected to Firebase Firestore (Spark Plan) via serviceAccountKey.json.');
    } else if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      db = admin.firestore();
      isFirebaseConnected = true;
      console.log(`🔥 Initialized Firebase Firestore with Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    } else {
      console.log('ℹ️  Firebase Spark Plan: Running with local encrypted persistent storage. (To connect live Cloud Firestore, provide Firebase service account in .env)');
    }
  } catch (error) {
    console.warn('⚠️ Firebase init warning:', error.message, '- Using local persistent encrypted store fallback.');
  }

  return db;
}

/**
 * Save Certificate Record (Stores AES Encrypted Payload & Cryptographic Metadata)
 */
export async function saveCertificateRecord(certificateId, record) {
  // 1. Save to local persistent storage
  const store = getLocalStore();
  store[certificateId] = {
    ...record,
    savedAt: new Date().toISOString()
  };
  saveLocalStore(store);

  // 2. Save to Firebase Firestore if connected (Spark Plan)
  if (isFirebaseConnected && db) {
    try {
      await db.collection('encrypted_certificates').doc(certificateId).set({
        ...record,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`🔥 Synced certificate ${certificateId} to Firebase Firestore.`);
    } catch (err) {
      console.error('Firebase Firestore save error:', err.message);
    }
  }

  return store[certificateId];
}

/**
 * Retrieve Certificate Record by ID
 */
export async function getCertificateRecord(certificateId) {
  // 1. Try Firebase Firestore first if connected
  if (isFirebaseConnected && db) {
    try {
      const doc = await db.collection('encrypted_certificates').doc(certificateId).get();
      if (doc.exists) {
        return doc.data();
      }
    } catch (err) {
      console.warn('Firestore fetch fallback to local store:', err.message);
    }
  }

  // 2. Local fallback
  const store = getLocalStore();
  return store[certificateId] || null;
}

/**
 * Delete Certificate Record by ID
 */
export async function deleteCertificateRecord(certificateId) {
  // 1. Delete from local persistent store
  const store = getLocalStore();
  if (store[certificateId]) {
    delete store[certificateId];
    saveLocalStore(store);
  }

  // 2. Delete from Firebase Firestore if connected
  if (isFirebaseConnected && db) {
    try {
      await db.collection('encrypted_certificates').doc(certificateId).delete();
      console.log(`🔥 Deleted certificate ${certificateId} from Firebase Firestore.`);
    } catch (err) {
      console.error('Firebase Firestore delete error:', err.message);
    }
  }

  return { success: true, deletedId: certificateId };
}

/**
 * Queue Email in Firebase Firestore 'mail' collection (Firebase Trigger Email extension standard)
 */
export async function queueFirebaseEmail({ to, message, metadata = {} }) {
  const mailId = `MAIL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const mailDoc = {
    to: Array.isArray(to) ? to : [to],
    message: {
      subject: message.subject || '',
      text: message.text || '',
      html: message.html || '',
      ...(message.attachments ? { attachments: message.attachments } : {})
    },
    metadata: {
      ...metadata,
      queuedAt: new Date().toISOString()
    },
    delivery: {
      state: 'PENDING',
      attempts: 0,
      queuedAt: new Date().toISOString()
    }
  };

  // 1. Save to local email queue store
  const MAIL_QUEUE_FILE = path.join(DATA_DIR, 'firebase_mail_queue.json');
  try {
    let queueStore = {};
    if (fs.existsSync(MAIL_QUEUE_FILE)) {
      try {
        queueStore = JSON.parse(fs.readFileSync(MAIL_QUEUE_FILE, 'utf8'));
      } catch {
        queueStore = {};
      }
    }
    queueStore[mailId] = mailDoc;
    fs.writeFileSync(MAIL_QUEUE_FILE, JSON.stringify(queueStore, null, 2), 'utf8');
  } catch (err) {
    console.warn('Local mail queue persistence warning:', err.message);
  }

  // 2. Save to Firebase Firestore 'mail' collection if connected
  let firestoreDocId = mailId;
  if (isFirebaseConnected && db) {
    try {
      const docRef = await db.collection('mail').add({
        ...mailDoc,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      firestoreDocId = docRef.id;
      console.log(`🔥 Queued email in Firebase Firestore 'mail' collection [Doc ID: ${firestoreDocId}]`);
    } catch (err) {
      console.error('Firebase Firestore email queue error:', err.message);
    }
  } else {
    console.log(`📨 Queued email locally in Firebase Trigger Email format [ID: ${mailId}]`);
  }

  return {
    queued: true,
    mailId: firestoreDocId,
    isCloudFirestore: isFirebaseConnected
  };
}

/**
 * Update Email Delivery status in Firebase Firestore 'mail' collection
 */
export async function updateFirebaseEmailDelivery(mailId, deliveryUpdate) {
  if (isFirebaseConnected && db && mailId) {
    try {
      const docRef = db.collection('mail').doc(mailId);
      await docRef.set({
        delivery: {
          ...deliveryUpdate,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }
      }, { merge: true });
      console.log(`🔥 Updated Firebase 'mail' delivery status for [Doc ID: ${mailId}]`);
    } catch (err) {
      console.warn('Firebase email delivery status update note:', err.message);
    }
  }

  // Also update local queue file
  const MAIL_QUEUE_FILE = path.join(DATA_DIR, 'firebase_mail_queue.json');
  try {
    if (fs.existsSync(MAIL_QUEUE_FILE)) {
      const queueStore = JSON.parse(fs.readFileSync(MAIL_QUEUE_FILE, 'utf8'));
      if (queueStore[mailId]) {
        queueStore[mailId].delivery = {
          ...queueStore[mailId].delivery,
          ...deliveryUpdate,
          updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(MAIL_QUEUE_FILE, JSON.stringify(queueStore, null, 2), 'utf8');
      }
    }
  } catch (err) {
    // Ignore local sync warning
  }
}

/**
 * Get all certificates list
 */
export async function getAllCertificates() {
  const store = getLocalStore();
  return Object.values(store);
}

export { isFirebaseConnected };

