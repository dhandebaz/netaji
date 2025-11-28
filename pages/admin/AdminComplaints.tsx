
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, MapPin, User, ArrowRight, Filter, Trash2 } from 'lucide-react';
import { getAllComplaints, updateComplaintStatus, dataSyncEvents } from '../../services/dataService';
import { PublicComplaint } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const AdminComplaints: React.FC = () => {
    const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setComplaints(getAllComplaints());
        
        // Listen for real-time complaint updates
        const unsubscribe = dataSyncEvents.on('complaintsFiled', (updatedComplaints: PublicComplaint[]) => {
            setComplaints(updatedComplaints);
        });
        
        return () => {
            window.removeEventListener('neta:complaintsFiled', unsubscribe as any);
        };
    }, []);

    const handleStatus = (id: string, status: any) => {
        updateComplaintStatus(id, status);
        // No need to manually refresh - event listener will update
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this complaint permanently?')) {
            setComplaints(getAllComplaints().filter(c => c.id !== id));
        }
    };

    const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-end mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Civic Wall Moderation</h1>
                    <p className="text-slate-500 font-medium">Review, verify, and escalate citizen reports.</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex-grow overflow-hidden flex flex-col">
                <div className="overflow-y-auto custom-scrollbar flex-grow p-6 space-y-4">
                    <AnimatePresence>
                        {filtered.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <AlertCircle className="mx-auto mb-4 opacity-20" size={48} />
                                <p className="font-bold">No complaints found.</p>
                            </div>
                        ) : (
                            filtered.map(c => (
                                <motion.div 
                                    key={c.id}
                                    layout
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="border border-slate-200 rounded-2xl p-5 flex gap-6 hover:shadow-md transition-all group bg-white"
                                >
                                    <div className="shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                                            c.category === 'Corruption' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {c.category[0]}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{c.location}</h4>
                                                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                                                    <span className="flex items-center gap-1"><User size={12}/> {c.userName}</span>
                                                    <span>•</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase tracking-wide text-[10px] font-bold">{c.category}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                                c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                c.status === 'dismissed' ? 'bg-slate-100 text-slate-500' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        
                                        <p className="text-slate-700 text-sm leading-relaxed mb-4">{c.description}</p>
                                        
                                        {c.proofOfWork && (
                                            <div className="bg-green-50 p-3 rounded-xl border border-green-100 mb-4 text-xs text-green-800">
                                                <span className="font-bold block mb-1">OFFICIAL RESPONSE:</span>
                                                {c.proofOfWork}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 pt-2">
                                            {c.status !== 'resolved' && c.status !== 'dismissed' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatus(c.id, 'investigating')}
                                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                                    >
                                                        Investigate
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatus(c.id, 'dismissed')}
                                                        className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                                                    >
                                                        Dismiss
                                                    </button>
                                                </>
                                            )}
                                            <div className="flex-grow"></div>
                                            <button 
                                                onClick={() => handleDelete(c.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminComplaints;
