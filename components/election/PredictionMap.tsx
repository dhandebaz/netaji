
import React from 'react';
import { motion } from 'framer-motion';
import { ElectionPrediction } from '../../types';

interface Props {
    predictions: ElectionPrediction[];
}

const PredictionMap: React.FC<Props> = ({ predictions }) => {
    // Simplified Grid Representation of India (144 cells)
    // Colors are distributed based on the win probability
    
    const topParty = predictions[0]?.party || 'Others';
    
    const getColor = () => {
        const rand = Math.random() * 100;
        let accumulated = 0;
        for (const p of predictions) {
            accumulated += p.winProbability;
            if (rand < accumulated) return p.color;
        }
        return '#e2e8f0'; // fallback
    };

    return (
        <div className="relative w-full h-[300px] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 gap-1 p-4 opacity-80">
                {Array.from({ length: 144 }).map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.005 }}
                        className="rounded-sm"
                        style={{ backgroundColor: getColor() }}
                    />
                ))}
            </div>
            <div className="relative z-10 bg-white/90 backdrop-blur px-6 py-3 rounded-xl shadow-lg border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Projected Winner</p>
                <h3 className="text-2xl font-black text-slate-900" style={{ color: predictions[0]?.color }}>{topParty}</h3>
            </div>
        </div>
    );
};

export default PredictionMap;
