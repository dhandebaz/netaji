
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Activity, ArrowUpRight, Clock, MapPin, AlertTriangle, Zap, Link, Box, MessageSquare } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAllRTITasks, getAllComplaints } from '../../services/dataService';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [rtiTasks, setRtiTasks] = useState(getAllRTITasks());
  const [ledgerHeight, setLedgerHeight] = useState(14205);
  const [complaints, setComplaints] = useState(getAllComplaints());
  const [liveLog, setLiveLog] = useState<string[]>([]);

  useEffect(() => {
      const interval = setInterval(() => {
          setLedgerHeight(prev => prev + Math.floor(Math.random() * 5));
          setComplaints(getAllComplaints());
          setRtiTasks(getAllRTITasks());
      }, 2000);
      return () => clearInterval(interval);
  }, []);

  // Derived Metrics
  const pendingRTI = rtiTasks.filter(t => t.status === 'generated' || t.status === 'claimed').length;
  const activeComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'investigating').length;
  
  // Mock Live Feed
  useEffect(() => {
      const actions = [
          "User 'Amit' claimed RTI-1024",
          "Vote #8892 verified on Blockchain",
          "New complaint filed in Varanasi: 'Pot holes'",
          "System alert: High traffic from Maharashtra region",
          "Prediction Engine updated: BJP +2 seats",
          "Data Pipeline: RSS Sync complete (124 items)"
      ];
      
      const interval = setInterval(() => {
          const newItem = actions[Math.floor(Math.random() * actions.length)];
          const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLiveLog(prev => [`[${time}] ${newItem}`, ...prev].slice(0, 8));
      }, 2500);

      return () => clearInterval(interval);
  }, []);
  
  // Chart Data (Mock)
  const trafficData = [
    { name: '00:00', users: 400, votes: 24 },
    { name: '04:00', users: 200, votes: 13 },
    { name: '08:00', users: 2000, votes: 450 },
    { name: '12:00', users: 3780, votes: 890 },
    { name: '16:00', users: 2890, votes: 620 },
    { name: '20:00', users: 1390, votes: 310 },
    { name: '23:59', users: 690, votes: 120 },
  ];

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
          value="14,203" 
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
          label="Prediction Conf." 
          value="89%" 
          subValue="AI Model: v3.2"
          color="purple"
        />
      </div>

      {/* Main Visualization Layer */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Traffic Chart */}
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

        {/* Alerts Column */}
        <div className="flex flex-col gap-6">
            {/* Live Log */}
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
