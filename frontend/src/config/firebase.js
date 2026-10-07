import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase Client Configuration (crp-bt-project)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAEcHJgiLMnV6RAVcNmvA9XVQy5FZFrwTs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "crp-bt-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "crp-bt-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "crp-bt-project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "208751647797",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:208751647797:web:398d32a0d02c9275aaa57c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DFQQ8JC55S"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export default app;
