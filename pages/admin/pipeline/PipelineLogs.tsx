
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, AlertCircle, CheckCircle, Info, RefreshCw } from 'lucide-react';
import { getLogs, JobLog } from '../../../services/schedulerService';

const PipelineLogs: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [logs, setLogs] = useState<JobLog[]>([]);

    const refreshLogs = () => {
        const data = getLogs();
        setLogs(data);
    };

    useEffect(() => {
        refreshLogs();
        // Poll for updates
        const interval = setInterval(refreshLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const filtered = logs.filter(l => filter === 'all' || l.type === filter);

    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-[24px]">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search logs..." 
                            className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    <div className="flex bg-white border border-slate-200 rounded-lg p-1">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md text-xs font-bold ${filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>All</button>
                        <button onClick={() => setFilter('error')} className={`px-3 py-1 rounded-md text-xs font-bold ${filter === 'error' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}>Errors</button>
                        <button onClick={() => setFilter('success')} className={`px-3 py-1 rounded-md text-xs font-bold ${filter === 'success' ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-50'}`}>Success</button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={refreshLogs} className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors">
                        <RefreshCw size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-grow p-2">
                {filtered.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                        No logs found. Run a job from the Scraper Manager.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs font-bold text-slate-400 uppercase bg-white sticky top-0 shadow-sm">
                            <tr>
                                <th className="p-3 w-32">Time</th>
                                <th className="p-3 w-24">Level</th>
                                <th className="p-3 w-48">Job ID</th>
                                <th className="p-3">Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-mono text-xs">
                            {filtered.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-3 text-slate-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </td>
                                    <td className="p-3">
                                        {log.type === 'success' && <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded w-fit"><CheckCircle size={12}/> OK</span>}
                                        {log.type === 'error' && <span className="text-red-600 flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded w-fit"><AlertCircle size={12}/> ERR</span>}
                                        {log.type === 'info' && <span className="text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded w-fit"><Info size={12}/> INF</span>}
                                    </td>
                                    <td className="p-3 font-bold text-slate-700">{log.jobId}</td>
                                    <td className="p-3 text-slate-600">{log.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default PipelineLogs;
