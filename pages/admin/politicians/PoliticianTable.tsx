
import React, { useState } from 'react';
import { Search, Filter, Plus, Users, CheckCircle, Trash2 } from 'lucide-react';
import { Politician } from '../../../types';

interface Props {
    type: string;
    data: Politician[];
    onAdd: () => void;
    onDelete: (id: number) => void;
}

const PoliticianTable: React.FC<Props> = ({ type, data, onAdd, onDelete }) => {
    const [search, setSearch] = useState('');
    
    const filtered = data.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    const isEmpty = filtered.length === 0;

    return (
        <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm flex-grow flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4 bg-slate-50/50">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={`Search ${type}s...`}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl border border-slate-200 bg-white">
                        <Filter size={18} />
                    </button>
                    <button 
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                    >
                        <Plus size={16} /> Add {type === 'elected' ? 'Official' : 'Candidate'}
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-grow overflow-y-auto custom-scrollbar">
                {isEmpty ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={32} className="opacity-20" />
                        </div>
                        <p className="font-bold text-sm">No {type}s found.</p>
                        <p className="text-xs mt-1">Add manually or use the scraper.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Profile</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Party & Constituency</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.photoUrl} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="" />
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{p.name}</p>
                                                <p className="text-xs text-slate-500">{p.age} yrs • {p.education}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-700 text-sm">{p.party}</span>
                                            <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{p.partyLogo}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">{p.constituency}, {p.state}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.verified ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                                <CheckCircle size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PoliticianTable;
