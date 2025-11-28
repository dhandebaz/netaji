
import React, { useState } from 'react';
import { MapPin, ChevronDown, Crosshair } from 'lucide-react';
import { STATES } from '../../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    onStateSelect: (state: string) => void;
}

const StateLocator: React.FC<Props> = ({ onStateSelect }) => {
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [locating, setLocating] = useState(false);

    const handleLocateMe = () => {
        setLocating(true);
        // Simulate geolocation API
        setTimeout(() => {
            const detected = "Uttar Pradesh"; // Mock result
            setSelectedState(detected);
            onStateSelect(detected);
            setLocating(false);
        }, 1500);
    };

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedState(val);
        onStateSelect(val);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-4 rounded-[28px] shadow-xl border border-slate-100 flex flex-col gap-4">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase text-xs tracking-wider mb-1">
                    <MapPin size={14} /> Local Intelligence
                </div>
                <h2 className="text-2xl font-black text-slate-900">Find Your Neta</h2>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-grow">
                    <select 
                        value={selectedState || ''}
                        onChange={handleSelect}
                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
                    >
                        <option value="">Select State...</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
                
                <button 
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center"
                    title="Locate Me"
                >
                    <Crosshair size={20} className={locating ? 'animate-spin' : ''} />
                </button>
            </div>
            
            {selectedState && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="text-center"
                >
                    <p className="text-xs text-slate-500 font-medium">Showing results for <span className="text-slate-900 font-bold">{selectedState}</span></p>
                </motion.div>
            )}
        </div>
    );
};

export default StateLocator;
