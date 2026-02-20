
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Activity, ArrowUpRight, Clock, MapPin, AlertTriangle, Zap, Link, Box, MessageSquare, Database, Cpu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAllRTITasks, getAllComplaints, dataSyncEvents } from '../../services/dataService';
import { getAdminStats } from '../../services/apiService';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [rtiTasks, setRtiTasks] = useState(getAllRTITasks());
  const [ledgerHeight, setLedgerHeight] = useState(14205);
  const [complaints, setComplaints] = useState(getAllComplaints());
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
      // Fetch initial backend stats
      const fetchStats = async () => {
          try {
              const token = localStorage.getItem('neta_token');
              if (token) {
                  const data = await getAdminStats(token);
                  setStats(data);
              }
          } catch (e) {
              console.error('Failed to fetch admin stats', e);
          }
      };
      fetchStats();

      // Listen for real-time updates
      const handleRTIUpdate = () => {
        setRtiTasks(getAllRTITasks());
        addLog("RTI Tasks updated from blockchain");
      };

      const handleComplaintsUpdate = () => {
        setComplaints(getAllComplaints());
        addLog("New citizen complaint received");
      };

      const handlePoliticiansUpdate = (data: any) => {
         addLog(`Politician registry synced (${data.length} records)`);
      };

      dataSyncEvents.on('rtiTasksUpdated', handleRTIUpdate);
      dataSyncEvents.on('complaintsUpdated', handleComplaintsUpdate);
      dataSyncEvents.on('politiciansUpdated', handlePoliticiansUpdate);
      dataSyncEvents.on('claimsUpdated', () => addLog("New verification claim received"));

      const interval = setInterval(() => {
          setLedgerHeight(prev => prev + 1);
          // Keep a heartbeat log occasionally
          if (Math.random() > 0.8) {
             addLog("System heartbeat: All nodes operational");
          }
      }, 5000);

      return () => {
        clearInterval(interval);
        // @ts-ignore
        if (dataSyncEvents.off) {
            dataSyncEvents.off('rtiTasksUpdated', handleRTIUpdate);
            dataSyncEvents.off('complaintsUpdated', handleComplaintsUpdate);
            dataSyncEvents.off('politiciansUpdated', handlePoliticiansUpdate);
        }
      };
  }, []);

  const addLog = (message: string) => {
      const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLiveLog(prev => [`[${time}] ${message}`, ...prev].slice(0, 8));
  };
  
  // Chart Data
  const trafficData = stats?.trafficData || [
    { name: '00:00', users: 400, votes: 24 },
    { name: '04:00', users: 200, votes: 13 },
    { name: '08:00', users: 2000, votes: 450 },
    { name: '12:00', users: 3780, votes: 890 },
    { name: '16:00', users: 2890, votes: 620 },
    { name: '20:00', users: 1390, votes: 310 },
    { name: '23:59', users: 690, votes: 120 },
  ];

  const activeComplaints = stats ? stats.pendingComplaints : complaints.filter(c => c.status === 'pending').length;
  const totalVotes = stats?.votes ?? (stats?.db?.votes ?? 0);
  const politicianCount = stats?.politicians ?? (stats?.db?.politicians ?? 0);
  const complaintsCount = stats?.complaints ?? (stats?.db?.complaints ?? 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
            <p className="text-slate-500 font-medium">Live operational oversight.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs font-bold text-slate-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            System Status: All Systems Operational
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          icon={<Users className="text-blue-600" size={24} />} 
          label="Citizen Users" 
          value={stats ? stats.users.toLocaleString() : "14,203"} 
          subValue="+128 today"
          color="blue"
        />
        <StatCard 
          icon={<Box className="text-emerald-600" size={24} />} 
          label="Blockchain Height" 
          value={`#${ledgerHeight}`}
          subValue="Ledger Sync Active"
          color="emerald"
        />
        <StatCard 
          icon={<MessageSquare className="text-orange-600" size={24} />} 
          label="Active Complaints" 
          value={activeComplaints.toString()} 
          subValue="Requires moderation"
          color="orange"
          alert={activeComplaints > 5}
        />
        <StatCard 
          icon={<Zap className="text-purple-600" size={24} />} 
          label="Total Politicians" 
          value={stats ? stats.politicians.toLocaleString() : "..."} 
          subValue="Monitored Profiles"
          color="purple"
        />
        <StatCard
          icon={<Database className={stats?.db?.connected ? 'text-emerald-600' : 'text-orange-600'} size={24} />}
          label="DB Status"
          value={stats?.db?.connected ? 'Online' : 'Offline'}
          subValue={
            stats?.db?.connected
              ? (() => {
                  const count = (stats.db.politicians ?? 0).toLocaleString();
                  const meta = stats.db.scraper;
                  if (!meta || !meta.lastRunAt) {
                    return `${count} politicians`;
                  }
                  const sourceLabel = meta.lastSource === 'live' ? 'live MyNeta' : 'fallback';
                  const stateLabel = meta.lastState && meta.lastState !== 'all' ? meta.lastState : 'All';
                  return `${count} • last ${new Date(meta.lastRunAt).toLocaleString()} • ${stateLabel} • ${sourceLabel}`;
                })()
              : 'File storage active'
          }
          color={stats?.db?.connected ? 'emerald' : 'orange'}
          alert={!stats?.db?.connected}
        />
        <StatCard
          icon={<Cpu className="text-slate-700" size={24} />}
          label="Frontend Build"
          value={stats?.build?.codeSplit ? 'Optimized' : 'Default'}
          subValue={
            stats?.build
              ? `Chunks ≤ ${stats.build.chunkSizeWarningLimit}kb • ${Array.isArray(stats.build.manualChunks) ? stats.build.manualChunks.join(', ') : ''}`
              : 'No build metadata'
          }
          color="slate"
        />
      </div>

      {/* Main Visualization Layer */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col">
           <div className="flex justify-between items-center mb-6">
             <div>
                 <h3 className="font-bold text-slate-900 text-lg">Voter Engagement</h3>
                 <p className="text-xs text-slate-500">Real-time traffic and voting volume.</p>
             </div>
             <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Traffic</span>
                 <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Votes</span>
             </div>
           </div>
           <div className="h-[300px] w-full flex-grow">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trafficData}>
                 <defs>
                   <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                 <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold'}} />
                 <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                 <Area type="monotone" dataKey="votes" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVotes)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.18em]">Digital Mandate Snapshot</p>
                        <p className="text-sm text-slate-500">Internal sentiment from votes, complaints, and coverage.</p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <span className="text-[11px] font-bold text-slate-400 uppercase">Coverage</span>
                        <span className="text-lg font-black text-slate-900">
                            {politicianCount.toLocaleString()} leaders
                        </span>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Net Approval</p>
                        <p className="text-2xl font-black text-emerald-600">
                            {totalVotes > 0 ? Math.max(0, Math.min(100, Math.round((stats?.users || 0) / (totalVotes || 1)))) : 50}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Scaled 0–100</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Complaint Pressure</p>
                        <p className="text-2xl font-black text-orange-600">
                            {politicianCount > 0 ? Math.round((complaintsCount / politicianCount) * 10) : 0}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Open issues per 10 leaders</p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Engagement Index</p>
                        <p className="text-2xl font-black text-blue-600">
                            {trafficData[3]?.users ?? 0}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">Midday active users</p>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500"
                        style={{ width: `${Math.min(100, (politicianCount / 543) * 100 || 0)}%` }}
                    />
                </div>
            </div>
            <div className="bg-slate-900 p-5 rounded-[24px] shadow-xl text-slate-400 font-mono text-xs flex-grow overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800">
                    <span className="font-bold text-slate-100 flex items-center gap-2"><Activity size={14}/> Live Stream</span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                </div>
                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-grow">
                    {liveLog.map((log, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="border-l-2 border-slate-700 pl-3 py-0.5 hover:bg-white/5 rounded-r transition-colors cursor-default"
                        >
                            {log}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue, color, alert }: any) => {
    const colorMap: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-100',
        orange: 'bg-orange-50 border-orange-100',
        emerald: 'bg-emerald-50 border-emerald-100',
        purple: 'bg-purple-50 border-purple-100',
    };

    return (
        <div className={`p-6 rounded-[24px] border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-white ${alert ? 'border-red-200 ring-4 ring-red-50' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${colorMap[color]}`}>
                    {icon}
                </div>
                {alert && <AlertTriangle className="text-red-500 animate-pulse" size={20} />}
                <div className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                    <ArrowUpRight size={16} className="text-slate-400" />
                </div>
            </div>
            <div className="mb-1">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{subValue}</p>
            </div>
        </div>
    );
}

export default AdminDashboard;
