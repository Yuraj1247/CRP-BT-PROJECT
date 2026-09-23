import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initRSAKeys } from './crypto/rsa.js';
import { initFirebase } from './config/firebase.js';
import { blockchain } from './crypto/blockchain.js';
import certificateRoutes from './routes/certificateRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Core Subsystems
console.log('--- Initializing Secure Certificate Backend ---');
initRSAKeys();
initFirebase();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/certificates', certificateRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Express Error Handler caught:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

process.on('uncaughtException', (err) => {
  console.error('CRITICAL Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Certificate Authority API Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
});

