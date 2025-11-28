
import React, { useState, useEffect } from 'react';
import { Inbox, Check, Send, User, MessageSquare, Clock, Search } from 'lucide-react';
import { getGrievances, resolveGrievance } from '../../services/adminService';
import { Grievance } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const AdminGrievances: React.FC = () => {
    const [grievances, setGrievances] = useState<Grievance[]>([]);
    const [replyText, setReplyText] = useState<Record<string, string>>({});
    const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

    useEffect(() => {
        setGrievances(getGrievances());
    }, []);

    const handleResolve = (id: string) => {
        const updated = resolveGrievance(id);
        setGrievances(updated);
    };

    const handleReplyChange = (id: string, text: string) => {
        setReplyText(prev => ({ ...prev, [id]: text }));
    }

    const filteredGrievances = grievances.filter(g => {
        if (filter === 'all') return true;
        return g.status === filter;
    });

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
             <div className="flex justify-between items-end mb-6 shrink-0">
                 <div>
                     <h1 className="text-3xl font-black text-slate-900">Help Desk</h1>
                     <p className="text-slate-500 font-medium">Manage support tickets and user feedback.</p>
                 </div>
                 <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                     <FilterButton label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
                     <FilterButton label="Open" active={filter === 'open'} onClick={() => setFilter('open')} count={grievances.filter(g => g.status === 'open').length} />
                     <FilterButton label="Resolved" active={filter === 'resolved'} onClick={() => setFilter('resolved')} />
                 </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex-grow overflow-hidden flex flex-col relative">
                 
                 {/* Search Bar */}
                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 flex items-center gap-3">
                     <Search className="text-slate-400" size={18} />
                     <input type="text" placeholder="Search tickets by email or subject..." className="bg-transparent outline-none text-sm font-medium w-full text-slate-600" />
                 </div>

                 <div className="overflow-y-auto custom-scrollbar flex-grow p-4 space-y-4">
                     {filteredGrievances.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-slate-400 pb-20">
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Inbox size={32} className="opacity-20" />
                             </div>
                             <p className="font-bold">No tickets found.</p>
                         </div>
                     ) : (
                         filteredGrievances.map(g => (
                             <TicketCard 
                                key={g.id} 
                                grievance={g} 
                                replyText={replyText[g.id] || ''}
                                onReplyChange={(text) => handleReplyChange(g.id, text)}
                                onResolve={() => handleResolve(g.id)}
                             />
                         ))
                     )}
                 </div>
             </div>
        </div>
    );
};

interface TicketCardProps {
    grievance: Grievance;
    replyText: string;
    onReplyChange: (t: string) => void;
    onResolve: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ grievance, replyText, onReplyChange, onResolve }) => {
    const isResolved = grievance.status === 'resolved';

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border transition-all group ${isResolved ? 'bg-slate-50 border-slate-100 opacity-80' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${isResolved ? 'bg-slate-300' : 'bg-blue-500'}`}>
                        {grievance.name[0]}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">{grievance.subject}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{grievance.name}</span>
                            <span>•</span>
                            <span className="font-mono">{grievance.email}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${isResolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600 animate-pulse'}`}>
                        {grievance.status}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center justify-end gap-1">
                        <Clock size={10} /> {new Date(grievance.date).toLocaleDateString()}
                    </p>
                </div>
            </div>
            
            <div className="bg-slate-50 p-5 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100 font-medium">
                {grievance.message}
            </div>
            
            {!isResolved && (
                <div className="mt-4 pl-4 border-l-2 border-slate-200">
                    <div className="flex gap-3">
                        <div className="flex-grow relative">
                            <input 
                                type="text" 
                                placeholder="Type a reply to user..." 
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                                value={replyText}
                                onChange={(e) => onReplyChange(e.target.value)}
                            />
                        </div>
                        <button className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                            <Send size={18}/>
                        </button>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-50">
                            Use Template
                        </button>
                        <button onClick={onResolve} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <Check size={14} /> Mark Resolved
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

const FilterButton = ({ label, active, onClick, count }: any) => (
    <button 
        onClick={onClick}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'
        }`}
    >
        {label}
        {count !== undefined && <span className={`px-1.5 py-0.5 rounded text-[9px] ${active ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-600'}`}>{count}</span>}
    </button>
)

export default AdminGrievances;
