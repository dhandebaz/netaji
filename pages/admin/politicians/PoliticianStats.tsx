
import React from 'react';
import { Database, CheckCircle, UserCheck, Globe, FileText, RefreshCw, Upload } from 'lucide-react';

interface Props {
    stats: {
        total: number;
        verified: number;
        pending: number;
        states: number;
    };
    onNavigate: (tab: string) => void;
}

const PoliticianStats: React.FC<Props> = ({ stats, onNavigate }) => {
    return (
        <div className="space-y-8 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <StatCard 
                    label="Total Registry" 
                    value={stats.total} 
                    icon={<Database size={20} />} 
                    color="blue" 
                    onClick={() => onNavigate('elected')}
                />
                <StatCard 
                    label="Verified Profiles" 
                    value={stats.verified} 
                    icon={<CheckCircle size={20} />} 
                    color="emerald" 
                    subValue={`${Math.round((stats.verified/stats.total)*100)}% of total`}
                />
                <StatCard 
                    label="Pending Claims" 
                    value={stats.pending} 
                    icon={<UserCheck size={20} />} 
                    color="orange" 
                    onClick={() => onNavigate('claims')}
                    alert={stats.pending > 0}
                />
                <StatCard 
                    label="State Coverage" 
                    value={stats.states} 
                    icon={<Globe size={20} />} 
                    color="purple" 
                    subValue="28 States + 8 UTs"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Activity Feed */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6">Recent Updates</h3>
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Affidavit Updated: Rahul Gandhi</p>
                                    <p className="text-xs text-slate-500">System Scraper • 2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-xl">
                    <h3 className="font-bold text-lg mb-4">Data Operations</h3>
                    <div className="space-y-3">
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-left px-4 flex items-center gap-3 transition-colors">
                            <RefreshCw size={16} /> Run Global Sync
                        </button>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-left px-4 flex items-center gap-3 transition-colors">
                            <Upload size={16} /> Bulk Upload CSV
                        </button>
                        <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold text-left px-4 flex items-center gap-3 transition-colors">
                            <Database size={16} /> Re-index Vectors
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon, color, subValue, onClick, alert }: any) => {
    const bgColors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        purple: 'bg-purple-50 text-purple-600'
    };

    return (
        <div 
            onClick={onClick}
            className={`p-5 rounded-2xl border transition-all bg-white flex flex-col justify-between h-32 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''} ${alert ? 'border-red-200 ring-2 ring-red-100' : 'border-slate-200'}`}
        >
            <div className="flex justify-between items-start">
                <div className={`p-2.5 rounded-xl ${bgColors[color]}`}>{icon}</div>
                {alert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
            </div>
            <div>
                <div className="text-2xl font-black text-slate-900">{value}</div>
                <div className="flex justify-between items-end">
                    <div className="text-xs font-bold text-slate-400 uppercase">{label}</div>
                    {subValue && <div className="text-[10px] font-bold text-slate-500">{subValue}</div>}
                </div>
            </div>
        </div>
    );
};

export default PoliticianStats;
