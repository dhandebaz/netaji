
import { VoteTransaction } from "../types";

// Simulated Blockchain Ledger
let MEMPOOL: VoteTransaction[] = [];
let BLOCK_HEIGHT = 14205;

// Initialize with some fake historical data
const generateMockLedger = (): VoteTransaction[] => {
    const txs: VoteTransaction[] = [];
    for (let i = 0; i < 15; i++) {
        txs.push({
            hash: generateHash(),
            timestamp: new Date(Date.now() - i * 1000 * 60).toISOString(),
            constituency: ['Varanasi', 'New Delhi', 'Gandhinagar', 'Wayanad', 'Mumbai South'][i % 5],
            type: Math.random() > 0.4 ? 'upvote' : 'downvote',
            blockHeight: BLOCK_HEIGHT - i
        });
    }
    return txs;
};

MEMPOOL = generateMockLedger();

function generateHash() {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
}

export const getPublicLedger = (): VoteTransaction[] => {
    return MEMPOOL;
};

export const recordVoteOnChain = (constituency: string, type: 'upvote' | 'downvote'): VoteTransaction => {
    BLOCK_HEIGHT++;
    const newTx: VoteTransaction = {
        hash: generateHash(),
        timestamp: new Date().toISOString(),
        constituency,
        type,
        blockHeight: BLOCK_HEIGHT
    };
    
    // Add to top of ledger
    MEMPOOL = [newTx, ...MEMPOOL].slice(0, 50); // Keep last 50 in memory for UI
    return newTx;
};

export const verifyHash = (hash: string): boolean => {
    // In a real app, this would verify against the merkle tree
    return MEMPOOL.some(tx => tx.hash === hash);
};
