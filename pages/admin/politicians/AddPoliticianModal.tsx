
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader, Download } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { Politician } from '../../../types';
import { scrapePolitician } from '../../../services/apiService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (p: Partial<Politician>) => void;
}

const AddPoliticianModal: React.FC<Props> = ({ isOpen, onClose, onAdd }) => {
    const [mode, setMode] = useState<'manual' | 'scrape'>('scrape');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [manualForm, setManualForm] = useState({ firstName: '', lastName: '', constituency: '', party: 'Independent' });
    const { addToast } = useToast();

    if (!isOpen) return null;

    const handleScrape = async () => {
        setLoading(true);
        try {
            const result = await scrapePolitician(url);
            // apiService.ts: apiCall returns T. server.js returns { success: true, data: fetched }
            // So result is { success: true, data: fetched }
            if (result && result.success && result.data) {
                const p = result.data;
                addToast("Data fetched successfully from source", 'success');
                
                const nameParts = p.name ? p.name.split(' ') : ['Unknown', 'Candidate'];
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                setManualForm({ 
                    firstName, 
                    lastName, 
                    constituency: p.constituency || 'Unknown', 
                    party: p.party || 'Independent' 
                });
                setMode('manual'); 
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error(error);
            addToast("Failed to scrape data. Please try again or enter manually.", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            name: `${manualForm.firstName} ${manualForm.lastName}`,
            party: manualForm.party,
            constituency: manualForm.constituency
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-xl rounded-[24px] shadow-2xl border border-slate-200 overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="font-black text-xl text-slate-900">Add Profile</h2>
                    <div className="flex bg-slate-200 p-1 rounded-lg">
                        <button 
                            onClick={() => setMode('scrape')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'scrape' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                        >
                            Scraper
                        </button>
                        <button 
                            onClick={() => setMode('manual')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'manual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                        >
                            Manual
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    {mode === 'scrape' ? (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Globe size={32} />
                            </div>
                            <h3 className="font-bold text-slate-900">Auto-Import from Web</h3>
                            <p className="text-sm text-slate-500">Paste a URL from MyNeta.info or ECI Affidavit portal to auto-fill details.</p>
                            
                            <div className="relative">
                                <input 
                                    type="url" 
                                    placeholder="https://myneta.info/LokSabha2024/candidate..." 
                                    className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handleScrape}
                                disabled={loading || !url}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader className="animate-spin" size={18}/> : <Download size={18}/>}
                                {loading ? 'Fetching Data...' : 'Fetch Profile'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        required 
                                        value={manualForm.firstName}
                                        onChange={e => setManualForm({...manualForm, firstName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                        required 
                                        value={manualForm.lastName}
                                        onChange={e => setManualForm({...manualForm, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Constituency</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
                                    placeholder="Search constituency..." 
                                    required
                                    value={manualForm.constituency}
                                    onChange={e => setManualForm({...manualForm, constituency: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Party</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                        value={manualForm.party}
                                        onChange={e => setManualForm({...manualForm, party: e.target.value})}
                                    >
                                        <option>Independent</option>
                                        <option>BJP</option>
                                        <option>INC</option>
                                        <option>AAP</option>
                                        <option>SP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                                        <option>Elected (Winner)</option>
                                        <option>Candidate</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800">Save Profile</button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AddPoliticianModal;
