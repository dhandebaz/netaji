
import React, { useEffect, useState } from 'react';
import { Hash, ShieldCheck, Box } from 'lucide-react';
import { VoteTransaction } from '../../types';
import { getPublicLedger } from '../../services/blockchainService';
import { motion, AnimatePresence } from 'framer-motion';

const BlockchainLedger: React.FC = () => {
    const [transactions, setTransactions] = useState<VoteTransaction[]>([]);

    useEffect(() => {
        // Poll for new blocks
        const interval = setInterval(() => {
            setTransactions(getPublicLedger());
        }, 2000);
        setTransactions(getPublicLedger());
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl text-white overflow-hidden relative font-mono h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">Public Vote Ledger</h3>
                        <p className="text-xs text-slate-500 mt-1">SHA-256 Immutable Record</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-500 font-bold uppercase">Current Height</div>
                    <div className="text-xl font-bold text-emerald-400 flex items-center gap-2 justify-end">
                        <Box size={16} /> #{transactions[0]?.blockHeight || 0}
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="relative h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900 z-20 pointer-events-none"></div>
                
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-1000">
                    <AnimatePresence>
                        {transactions.map((tx) => (
                            <motion.div 
                                key={tx.hash}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className={`w-2 h-2 rounded-full shrink-0 ${tx.type === 'upvote' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-slate-300">{tx.constituency}</span>
                                        <span className="text-[10px] text-slate-600">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                        <Hash size={10} />
                                        <span className="truncate font-mono">{tx.hash}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BlockchainLedger;
