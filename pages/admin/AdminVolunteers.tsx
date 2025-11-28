
import React, { useState, useEffect } from 'react';
import { Search, Shield, AlertTriangle, Award, MoreVertical, MapPin, Mail, Phone, X, CheckCircle, Ban } from 'lucide-react';
import { getAllVolunteers } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Volunteer } from '../../types';

const AdminVolunteers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  useEffect(() => {
    setVolunteers(getAllVolunteers());
  }, []);

  const filtered = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAction = (id: number, action: 'ban' | 'promote') => {
      // In a real app, this would call an API
      alert(`${action === 'ban' ? 'Banned' : 'Promoted'} volunteer ID: ${id}`);
      if (action === 'ban') {
          setVolunteers(prev => prev.filter(v => v.id !== id));
          setSelectedVolunteer(null);
      }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col">
       
       {/* Header & Toolbar */}
       <div className="flex justify-between items-end mb-6 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Nyay Fauj CRM</h1>
            <p className="text-slate-500 font-medium">Manage the volunteer force and track field performance.</p>
          </div>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search agents..." 
                  className="pl-11 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 w-72 bg-white shadow-sm font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <button className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">
                Export CSV
             </button>
          </div>
       </div>

       {/* Data Table Card */}
       <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex-grow overflow-hidden flex flex-col">
          <div className="overflow-y-auto custom-scrollbar flex-grow">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Volunteer Profile</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Jurisdiction</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Rank & Reputation</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Missions</th>
                    <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(v => (
                    <tr 
                        key={v.id} 
                        onClick={() => setSelectedVolunteer(v)}
                        className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                    >
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-black text-lg shadow-sm border border-white relative">
                                {v.name[0]}
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                <p className="font-bold text-slate-900 text-base">{v.name}</p>
                                <p className="text-xs text-slate-400 font-mono">ID: NF-{v.id.toString().padStart(4, '0')}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                                <MapPin size={16} className="text-slate-400" /> {v.state}
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 border border-yellow-200">
                                    <Shield size={16} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-500">Level {Math.floor(v.points / 100) + 1}</p>
                                    <p className="font-bold text-slate-900">{v.points} XP</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm">{v.rtisFiled}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAction(v.id, 'promote'); }}
                                    className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors" 
                                    title="Promote"
                                >
                                    <Award size={18} />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAction(v.id, 'ban'); }}
                                    className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" 
                                    title="Ban User"
                                >
                                    <Ban size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-20 text-center text-slate-400 font-medium">No volunteers found matching criteria.</div>}
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs font-bold text-slate-500">
             <span>Showing {filtered.length} Agents</span>
             <div className="flex gap-2">
                 <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Previous</button>
                 <button className="px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">Next</button>
             </div>
          </div>
       </div>

       {/* Slide-over Profile Details */}
       <AnimatePresence>
         {selectedVolunteer && (
             <>
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedVolunteer(null)}
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                />
                <motion.div 
                    initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
                >
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="font-black text-xl text-slate-900">Agent Profile</h2>
                        <button onClick={() => setSelectedVolunteer(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 space-y-8">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-3xl bg-blue-600 text-white flex items-center justify-center text-3xl font-black mx-auto mb-4 shadow-xl shadow-blue-200">
                                {selectedVolunteer.name[0]}
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">{selectedVolunteer.name}</h3>
                            <p className="text-slate-500 font-medium flex items-center justify-center gap-2 mt-1">
                                <MapPin size={14} /> {selectedVolunteer.state}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Rank</p>
                                <p className="text-xl font-black text-slate-900">#{selectedVolunteer.rank}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Impact</p>
                                <p className="text-xl font-black text-blue-600">{selectedVolunteer.points}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Contact Information</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                                    <Mail className="text-slate-400" size={18} />
                                    <span className="text-sm font-medium text-slate-600">volunteer.{selectedVolunteer.id}@neta.app</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
                                    <Phone className="text-slate-400" size={18} />
                                    <span className="text-sm font-medium text-slate-600">+91 98765 43210</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Performance History</h4>
                            <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                                {[1,2,3].map(i => (
                                    <div key={i} className="pl-10 relative">
                                        <div className="absolute left-2 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                                        <p className="text-xs font-bold text-slate-400 mb-1">Oct {20 + i}, 2025</p>
                                        <p className="text-sm font-bold text-slate-800">Filed RTI regarding Road Infrastructure</p>
                                        <p className="text-xs text-slate-500 mt-1">Status: Response Pending</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-slate-50">
                        <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => handleAction(selectedVolunteer.id, 'ban')} className="py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors">
                                 Suspend
                             </button>
                             <button className="py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                                 Message
                             </button>
                        </div>
                    </div>
                </motion.div>
             </>
         )}
       </AnimatePresence>
    </div>
  );
};

export default AdminVolunteers;
