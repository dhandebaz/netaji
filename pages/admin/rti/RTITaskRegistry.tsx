
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { getRTITasks } from '../../../services/rtiService';
import { RTITask } from '../../../types';

const RTITaskRegistry: React.FC = () => {
    const [tasks, setTasks] = useState<RTITask[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        setTasks(getRTITasks());
    }, []);

    const filtered = tasks.filter(t => {
        const matchesSearch = t.topic.toLowerCase().includes(searchTerm.toLowerCase()) || t.politicianName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex flex-col h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
                <div className="flex items-center gap-3 flex-grow">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by topic, politician..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <select 
                            className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-blue-500 cursor-pointer"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="generated">Generated</option>
                            <option value="claimed">Claimed</option>
                            <option value="filed">Filed</option>
                            <option value="response_received">Review</option>
                            <option value="verified">Verified</option>
                        </select>
                        <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="flex-grow overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Target</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filtered.map(task => (
                            <tr key={task.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="p-4 font-bold text-slate-800 max-w-xs truncate" title={task.topic}>
                                    {task.topic}
                                </td>
                                <td className="p-4 text-slate-600">{task.politicianName}</td>
                                <td className="p-4">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="p-4 text-slate-500">
                                    {task.claimedBy ? <span className="font-bold text-blue-600">{task.claimedBy}</span> : <span className="opacity-50">-</span>}
                                </td>
                                <td className="p-4 text-slate-500 font-mono text-xs">
                                    {new Date(task.generatedDate).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16}/></button>
                                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">No records found.</div>}
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        generated: 'bg-slate-100 text-slate-600',
        claimed: 'bg-orange-100 text-orange-700',
        filed: 'bg-purple-100 text-purple-700',
        response_received: 'bg-blue-100 text-blue-700',
        verified: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700'
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.generated}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default RTITaskRegistry;
