
import React, { useState, useEffect, useRef } from 'react';
import { 
    BrainCircuit, Database, Zap, Terminal, Activity, Server, 
    AlertTriangle, RefreshCw, Cpu, Network, Layers, Clock,
    CheckCircle, Settings, ChevronDown
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { motion } from 'framer-motion';

const AdminAICore: React.FC = () => {
  const [activeModel, setActiveModel] = useState('Gemini 2.5 Flash');
  const [systemStatus, setSystemStatus] = useState<'optimal' | 'degraded'>('optimal');

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
       
       {/* Header Section */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                    <BrainCircuit size={28} />
                </div>
                Neural Core
            </h1>
            <p className="text-slate-500 font-medium mt-2 ml-1">
                Real-time telemetry for LLM inference, RAG pipelines, and Agent behavior.
            </p>
         </div>
         <div className="flex gap-3">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${
                 systemStatus === 'optimal' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
             }`}>
                 <Activity size={18} className={systemStatus === 'optimal' ? "" : "animate-pulse"} />
                 <span className="font-bold text-sm">System: {systemStatus === 'optimal' ? 'Optimal' : 'High Latency'}</span>
             </div>
             <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
                 <RefreshCw size={16} /> Reset Context
             </button>
         </div>
       </div>

       {/* Metrics Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard 
            label="Requests / Min" 
            value="2,405" 
            trend="+12%" 
            icon={<Network size={20}/>} 
            color="blue"
          />
          <MetricCard 
            label="Avg Latency (P95)" 
            value="142ms" 
            trend="-5%" 
            icon={<Clock size={20}/>} 
            color="purple"
            inverse
          />
          <MetricCard 
            label="Token Usage (Hr)" 
            value="450k" 
            trend="+8%" 
            icon={<Zap size={20}/>} 
            color="orange"
          />
          <MetricCard 
            label="Vector Cache Hit" 
            value="94.2%" 
            trend="+1%" 
            icon={<Layers size={20}/>} 
            color="emerald"
          />
       </div>

       {/* Main Dashboard Grid */}
       <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left: Performance Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="font-bold text-slate-900 text-lg">Inference Performance</h3>
                      <p className="text-xs text-slate-500">Latency vs Request Volume (Last 1 Hour)</p>
                  </div>
                  <div className="flex gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Requests</span>
                      <span className="flex items-center gap-1.5 text-purple-600"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Latency</span>
                  </div>
              </div>
              <div className="flex-grow min-h-[300px]">
                  <PerformanceChart />
              </div>
          </div>

          {/* Right: Model Configuration */}
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                  <Settings size={18} className="text-slate-400" /> Active Configuration
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Routing Model</label>
                      <div className="relative">
                          <select 
                            value={activeModel}
                            onChange={(e) => setActiveModel(e.target.value)}
                            className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          >
                              <option>Gemini 2.5 Flash (Recommended)</option>
                              <option>Gemini 2.5 Flash Lite</option>
                              <option>Gemini 3.0 Pro (High Cost)</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">Thinking Budget</span>
                          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded">1024 Tokens</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[25%]"></div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">Temperature</span>
                          <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2 py-1 rounded">0.4</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 w-[40%]"></div>
                      </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 flex gap-3">
                      <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                      <p>Changes to the active model will trigger a 200ms cold start for the next request.</p>
                  </div>
              </div>
          </div>
       </div>

       {/* Bottom Grid: Logs & RAG */}
       <div className="grid lg:grid-cols-2 gap-6">
           
           {/* Live Terminal */}
           <div className="bg-[#0f172a] rounded-[24px] shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[400px]">
                <div className="px-5 py-3 bg-[#1e293b] border-b border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-slate-200 font-mono">AGENT_TRACE_LOG</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                </div>
                <LiveLog />
           </div>

           {/* Vector DB Visualization */}
           <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col h-[400px]">
               <div className="flex justify-between items-start mb-6">
                   <div>
                       <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                           <Database size={18} className="text-purple-600" /> Knowledge Base
                       </h3>
                       <p className="text-xs text-slate-500 mt-1">Pinecone Index Status</p>
                   </div>
                   <div className="text-right">
                       <div className="text-2xl font-black text-slate-900">842k</div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase">Vectors Indexed</div>
                   </div>
               </div>

               <div className="flex-grow flex gap-4">
                   <div className="w-1/3 flex flex-col justify-center gap-4">
                       <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-center">
                           <p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Dimensions</p>
                           <p className="text-xl font-black text-purple-900">1536</p>
                       </div>
                       <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                           <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Namespaces</p>
                           <p className="text-xl font-black text-blue-900">4</p>
                       </div>
                       <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                           <p className="text-[10px] font-bold text-emerald-400 uppercase mb-1">Pod Type</p>
                           <p className="text-xl font-black text-emerald-900">p2.x1</p>
                       </div>
                   </div>
                   <div className="w-2/3 bg-slate-50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-center">Index Topography</p>
                       {/* Abstract visualization of vectors */}
                       <div className="absolute inset-0 flex items-center justify-center opacity-30">
                           <div className="w-48 h-48 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
                       </div>
                       <div className="relative z-10 h-full flex items-end justify-between gap-1 px-4 pb-2">
                           {[40, 65, 30, 80, 55, 90, 45, 70, 35, 60].map((h, i) => (
                               <motion.div 
                                    key={i}
                                    initial={{ height: '10%' }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                                    className="w-full bg-slate-900 rounded-t-sm opacity-20"
                               />
                           ))}
                       </div>
                   </div>
               </div>
           </div>

       </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const MetricCard = ({ label, value, trend, icon, color, inverse }: any) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };

    const isPositive = trend.startsWith('+');
    const isGood = inverse ? !isPositive : isPositive;

    return (
        <div className="bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-between h-[140px] transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl ${colors[color]}`}>
                    {icon}
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${isGood ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{label}</p>
            </div>
        </div>
    );
};

const PerformanceChart = () => {
    const data = [
        { time: '10:00', latency: 120, req: 2400 },
        { time: '10:05', latency: 132, req: 2800 },
        { time: '10:10', latency: 145, req: 3200 },
        { time: '10:15', latency: 125, req: 2900 },
        { time: '10:20', latency: 110, req: 2100 },
        { time: '10:25', latency: 115, req: 2300 },
        { time: '10:30', latency: 150, req: 3500 },
        { time: '10:35', latency: 165, req: 3800 },
        { time: '10:40', latency: 140, req: 3100 },
        { time: '10:45', latency: 130, req: 2600 },
        { time: '10:50', latency: 125, req: 2400 },
        { time: '10:55', latency: 118, req: 2200 },
    ];

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1)'}}
                    labelStyle={{fontWeight: 'bold', color: '#1e293b'}}
                />
                <Area yAxisId="left" type="monotone" dataKey="req" stroke="#3b82f6" strokeWidth={3} fill="url(#colorReq)" name="Requests" />
                <Area yAxisId="right" type="monotone" dataKey="latency" stroke="#a855f7" strokeWidth={3} fill="url(#colorLat)" name="Latency (ms)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const LiveLog = () => {
    const [logs, setLogs] = useState<string[]>([
        "> [INIT] Neural Core System Online.",
        "> [CONN] Gateway: Gemini 2.5 Flash established.",
    ]);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const actions = [
            "[RAG] Retrieved 4 chunks from 'Varanasi_Assets_2024'",
            "[GEN] Generating response for user_id: 8821",
            "[CACHE] Hit on key: 'Delhi_Election_Stats'",
            "[WARN] Context window at 85% capacity",
            "[SUCCESS] Response dispatched in 1.2s",
            "[AUDIT] Flagged toxic content in input stream"
        ];

        const interval = setInterval(() => {
            const action = actions[Math.floor(Math.random() * actions.length)];
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            setLogs(prev => [...prev.slice(-12), `> [${timestamp}] ${action}`]);
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="p-6 font-mono text-xs text-emerald-400 space-y-3 flex-grow overflow-y-auto custom-scrollbar-dark">
            {logs.map((log, i) => (
                <div key={i} className="opacity-90 border-l-2 border-transparent hover:border-emerald-500/50 pl-2 transition-colors">
                    {log}
                </div>
            ))}
            <div ref={endRef} />
            <div className="animate-pulse">_</div>
        </div>
    );
};

export default AdminAICore;
