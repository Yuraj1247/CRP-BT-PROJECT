import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const CHAIN_FILE = path.join(DATA_DIR, 'blockchain.json');

export class Block {
  constructor(index, timestamp, certificateId, certificateHash, signature, previousHash = '', nonce = 0) {
    this.index = index;
    this.timestamp = timestamp;
    this.certificateId = certificateId;
    this.certificateHash = certificateHash;
    this.signature = signature;
    this.previousHash = previousHash;
    this.nonce = nonce;
    this.blockHash = this.calculateHash();
  }

  calculateHash() {
    const payload = `${this.index}|${this.timestamp}|${this.certificateId}|${this.certificateHash}|${this.signature}|${this.previousHash}|${this.nonce}`;
    return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
  }
}

export class BlockchainLedger {
  constructor() {
    this.chain = [];
    this.initLedger();
  }

  initLedger() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(CHAIN_FILE)) {
      try {
        const raw = fs.readFileSync(CHAIN_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.chain = parsed.map(b => {
            const block = new Block(
              b.index,
              b.timestamp,
              b.certificateId,
              b.certificateHash,
              b.signature,
              b.previousHash,
              b.nonce
            );
            block.blockHash = b.blockHash;
            return block;
          });
          console.log(`⛓️  Loaded ${this.chain.length} blocks from Blockchain ledger.`);
          return;
        }
      } catch (err) {
        console.warn('Could not read existing blockchain file, creating fresh genesis block.');
      }
    }

    // Initialize with Genesis Block
    const genesisBlock = new Block(
      0,
      '2026-01-01T00:00:00.000Z',
      'GENESIS-CERT',
      '0000000000000000000000000000000000000000000000000000000000000000',
      'GENESIS_SIGNATURE_IMMUTABLE_ROOT',
      '0'
    );
    this.chain = [genesisBlock];
    this.saveLedger();
    console.log('⛓️  Genesis Block initialized for Blockchain Verification Ledger.');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Appends a new certificate transaction block to the immutable chain.
   */
  addCertificateBlock(certificateId, certificateHash, signature) {
    const previousBlock = this.getLatestBlock();
    const newIndex = previousBlock.index + 1;
    const timestamp = new Date().toISOString();
    
    // Nonce computation for cryptographic proof of recording
    let nonce = 0;
    let newBlock = new Block(newIndex, timestamp, certificateId, certificateHash, signature, previousBlock.blockHash, nonce);
    
    this.chain.push(newBlock);
    this.saveLedger();
    return newBlock;
  }

  /**
   * Verifies the full blockchain integrity:
   * 1. Every block's internal hash matches its calculated hash.
   * 2. Every block's previousHash matches the preceding block's blockHash.
   */
  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify current block's hash integrity
      if (currentBlock.blockHash !== currentBlock.calculateHash()) {
        return {
          isValid: false,
          error: `Block #${currentBlock.index} hash mismatch. Data was tampered!`,
          compromisedBlockIndex: currentBlock.index
        };
      }

      // Verify chain linkage
      if (currentBlock.previousHash !== previousBlock.blockHash) {
        return {
          isValid: false,
          error: `Block #${currentBlock.index} previousHash does not match Block #${previousBlock.index} hash. Broken chain!`,
          compromisedBlockIndex: currentBlock.index
        };
      }
    }

    return {
      isValid: true,
      totalBlocks: this.chain.length,
      latestBlockHash: this.getLatestBlock().blockHash
    };
  }

  getBlockByCertificateId(certificateId) {
    return this.chain.find(b => b.certificateId.toLowerCase() === certificateId.toLowerCase()) || null;
  }

  getChain() {
    return this.chain;
  }

  saveLedger() {
    try {
      fs.writeFileSync(CHAIN_FILE, JSON.stringify(this.chain, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write blockchain ledger to disk:', err);
    }
  }
}

export const blockchain = new BlockchainLedger();
