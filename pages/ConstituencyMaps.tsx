
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Map as MapIcon, Users, TrendingUp, ChevronRight, Filter, 
  BarChart3, Briefcase, AlertTriangle, PieChart as PieIcon, History, 
  Zap, Download, FileText, Share2, ExternalLink, AlertOctagon, 
  CheckCircle, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATES } from '../constants';
import { getAllPoliticians, getConstituencyIntelByState, fetchRealDataFromBackend } from '../services/dataService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { jsPDF } from "jspdf";

// --- Types & Advanced Data Generator ---

interface StateData {
  id: string;
  seats: number;
  turnout: string;
  winningParty: string;
  literacy: number;
  gdpPerCapita: string;
  swingFactor: 'High' | 'Medium' | 'Low' | 'Safe'; 
  urbanRural: { name: string; value: number }[];
  genderRatio: { name: string; value: number }[];
  socialGroups: { name: string; value: number; color: string }[]; // New: Demographics
  keyIssues: string[];
  turnoutTrend: { year: string; turnout: number }[];
  partyShare: { name: string; value: number; color: string }[];
  sentiment: 'Positive' | 'Neutral' | 'Anti-Incumbency';
}

// Helper to generate consistent mock data for ALL states
const generateStateData = (stateName: string): StateData => {
  // Seeded random-ish behavior based on name length
  const seed = stateName.length; 
  const isSwing = seed % 3 === 0;
  const seats = Math.max(2, (seed * 5) % 80);
  
  const parties = ['BJP', 'INC', 'Regional', 'Others'];
  const partyColors = {'BJP': '#f97316', 'INC': '#10b981', 'Regional': '#3b82f6', 'Others': '#94a3b8'};
  
  // Randomized Party Share
  let remaining = 100;
  const share = parties.map((p, i) => {
    const val = i === 3 ? remaining : Math.floor(Math.random() * (remaining - 10));
    remaining -= val;
    return { name: p, value: Math.max(5, val), color: partyColors[p as keyof typeof partyColors] };
  }).sort((a, b) => b.value - a.value);

  return {
    id: stateName,
    seats: seats,
    turnout: `${50 + (seed * 2) % 40}%`,
    winningParty: share[0].name,
    literacy: 60 + (seed * 3) % 35,
    gdpPerCapita: `₹${1 + (seed % 3)},${(seed * 1234) % 90000}`,
    swingFactor: isSwing ? 'High' : (seed % 2 === 0 ? 'Medium' : 'Safe'),
    sentiment: isSwing ? 'Anti-Incumbency' : 'Neutral',
    urbanRural: [
      { name: 'Urban', value: 20 + (seed * 2) }, 
      { name: 'Rural', value: 100 - (20 + (seed * 2)) }
    ],
    genderRatio: [
      { name: 'Male', value: 52 }, 
      { name: 'Female', value: 48 }
    ],
    socialGroups: [
      { name: 'General', value: 25, color: '#64748b' },
      { name: 'OBC', value: 35, color: '#f59e0b' },
      { name: 'SC/ST', value: 25, color: '#8b5cf6' },
      { name: 'Minorities', value: 15, color: '#10b981' }
    ],
    keyIssues: ["Unemployment", "Infrastructure", "Farm Laws", "Inflation", "Identity Politics"].slice(0, 3 + (seed % 2)),
    turnoutTrend: [
      { year: '2009', turnout: 55 + (seed % 10) },
      { year: '2014', turnout: 60 + (seed % 10) },
      { year: '2019', turnout: 62 + (seed % 10) },
      { year: '2024', turnout: 65 + (seed % 10) },
    ],
    partyShare: share
  };
};

// Pre-compute data for all available states
const FULL_INDIA_DATA: Record<string, StateData> = {};
STATES.forEach(state => {
  FULL_INDIA_DATA[state] = generateStateData(state);
});

// --- Components ---

const ConstituencyMaps: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'history'>('overview');
  const [downloading, setDownloading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const activePoliticians = useMemo(() => {
    if (!selectedState) return [];
    return getAllPoliticians().filter(p => p.state === selectedState);
  }, [selectedState]);

  const stats = useMemo(() => {
    if (!selectedState) return null;
    const base = FULL_INDIA_DATA[selectedState];
    const intel = getConstituencyIntelByState(selectedState);
    return {
      ...base,
      approvalFromPlatform: intel.avgApproval,
      totalLeaders: intel.total,
      verifiedLeaders: intel.verified,
    } as StateData & { approvalFromPlatform: number; totalLeaders: number; verifiedLeaders: number };
  }, [selectedState]);

  const handleSync = async () => {
    if (!selectedState) return;
    setIsSyncing(true);
    try {
      const ok = await fetchRealDataFromBackend(selectedState);
      if (!ok) {
        console.warn('[ConstituencyMaps] Intel refresh failed or returned no live data');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!stats) return;
    setDownloading(true);
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${stats.id} - Election Strategy Report 2025`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Projected Turnout: ${stats.turnout}`, 20, 40);
    doc.text(`Total Seats: ${stats.seats}`, 20, 50);
    doc.text(`Swing Factor: ${stats.swingFactor}`, 20, 60);
    doc.text(`Dominant Party Projection: ${stats.winningParty}`, 20, 70);
    
    doc.text("Key Issues:", 20, 90);
    stats.keyIssues.forEach((issue, i) => {
        doc.text(`- ${issue}`, 30, 100 + (i * 10));
    });

    doc.text("Generated by Neta Analytics Engine", 20, 150);
    
    setTimeout(() => {
        doc.save(`${stats.id}_Report_2025.pdf`);
        setDownloading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pt-20 pb-12 px-4 md:px-8 overflow-hidden">
      
      {/* BACKGROUND DECOR */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px]"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="max-w-[1400px] mx-auto h-full flex flex-col lg:h-[calc(100vh-100px)]">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4 shrink-0">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-200">
                   <MapIcon size={24} />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
                   Constituency <span className="text-blue-600">Intel</span>
                </h1>
             </div>
             <p className="text-slate-500 font-medium max-w-xl">
                Hyper-local electoral data for 543 constituencies. Data-driven sentiment analysis and swing projections.
             </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-grow md:w-72 group z-20">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                 <select 
                    className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/50 font-bold text-slate-700 appearance-none cursor-pointer transition-shadow hover:shadow-md"
                    value={selectedState || ''}
                    onChange={(e) => setSelectedState(e.target.value || null)}
                 >
                    <option value="">Select State / UT</option>
                    {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                 </select>
                 <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16} />
              </div>
              <button 
                type="button"
                onClick={handleSync}
                disabled={!selectedState || isSyncing}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:bg-slate-800 transition-colors"
              >
                {isSyncing ? 'Refreshing…' : 'Refresh Intel'}
              </button>
              
              {selectedState && (
                  <button 
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="bg-slate-900 text-white p-3 rounded-xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70"
                    title="Download PDF Report"
                  >
                      {downloading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> : <Download size={20} />}
                  </button>
              )}
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-12 gap-6 flex-grow min-h-0">
           
           {/* LEFT: MAP CONTAINER */}
           <div className="lg:col-span-7 bg-white rounded-[32px] shadow-xl border border-slate-200 relative overflow-hidden flex flex-col group">
               
               {/* Map Controls / Legend */}
               <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
                   <div className="bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 shadow-sm flex items-center gap-3 pointer-events-auto">
                       <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Swing</span>
                       <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Safe</span>
                       <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600"></span> Selected</span>
                   </div>
               </div>

               {/* Map Surface */}
               <div className="flex-grow relative bg-slate-50/50 overflow-auto custom-scrollbar flex items-center justify-center cursor-crosshair">
                   <div className="absolute inset-0 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
                   <IndiaHexMap onSelectState={setSelectedState} selectedState={selectedState} />
               </div>
           </div>

           {/* RIGHT: DATA DASHBOARD */}
           <div className="lg:col-span-5 flex flex-col min-h-0">
              <AnimatePresence mode="wait">
                {!selectedState || !stats ? (
                    /* IDLE STATE */
                    <motion.div 
                        key="idle"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="h-full bg-white rounded-[32px] shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 opacity-50"></div>
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-500 animate-pulse">
                            <MapIcon size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Region</h2>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">Tap a state on the map to unlock real-time political intelligence.</p>
                        
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <Users className="mx-auto mb-2 text-slate-400" size={20} />
                                 <p className="text-xs font-bold text-slate-500 uppercase">Demographics</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                 <TrendingUp className="mx-auto mb-2 text-slate-400" size={20} />
                                 <p className="text-xs font-bold text-slate-500 uppercase">Trends</p>
                             </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ACTIVE DASHBOARD */
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="h-full flex flex-col gap-4"
                    >
                        {/* 1. State KPI Card */}
                        <div className="bg-white rounded-[28px] p-6 shadow-lg border border-slate-100 relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-[100px] -z-10"></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 leading-none mb-1">{stats.id}</h2>
                                    <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
                                        {stats.seats} Parliamentary Seats
                                    </p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                                    stats.swingFactor === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                                    stats.swingFactor === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                    'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                    <AlertOctagon size={12} /> {stats.swingFactor} Volatility
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <KPIBox label="Proj. Turnout" value={stats.turnout} color="blue" />
                                <KPIBox label="Winning Odds" value={stats.winningParty} color="purple" />
                                <KPIBox label="Platform Approval" value={`${stats.approvalFromPlatform || 0}%`} color="emerald" />
                            </div>
                        </div>

                        {/* 2. Tabbed Content Area */}
                        <div className="flex-grow bg-white rounded-[28px] shadow-lg border border-slate-100 flex flex-col min-h-0 overflow-hidden">
                            <div className="flex items-center p-2 gap-1 border-b border-slate-100 bg-slate-50/50">
                                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" icon={<Zap size={14}/>} />
                                <TabButton active={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')} label="Demographics" icon={<PieIcon size={14}/>} />
                                <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" icon={<History size={14}/>} />
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar p-6">
                                {/* TAB: OVERVIEW */}
                                {activeTab === 'overview' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        {/* Party Vote Share */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center justify-between">
                                                <span>Projected Vote Share</span>
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">Neta Projection</span>
                                            </h4>
                                            <div className="h-32 w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart layout="vertical" data={stats.partyShare} barSize={12}>
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 11, fontWeight: 600, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                                            {stats.partyShare.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        
                                        {/* Sentiment & Issues */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className={`p-4 rounded-2xl border ${stats.sentiment === 'Anti-Incumbency' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                                                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase opacity-70">
                                                    <TrendingUp size={14} /> Sentiment
                                                </div>
                                                <p className="text-lg font-black leading-tight">{stats.sentiment}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase text-slate-400">
                                                    <AlertTriangle size={14} /> Top Issue
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight">{stats.keyIssues[0]}</p>
                                            </div>
                                        </div>

                                        {/* Candidates */}
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Key Candidates</h4>
                                            <div className="space-y-2">
                                                {activePoliticians.length > 0 ? activePoliticians.map(p => (
                                                    <Link to={`/politician/${p.slug}`} key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                                                        <ImageWithFallback src={p.photoUrl} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt={p.name} />
                                                        <div className="flex-grow">
                                                            <p className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold">{p.party} • {p.constituency}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-xs font-bold text-green-600">{p.approvalRating}%</div>
                                                            <div className="text-[10px] text-slate-400">Approval</div>
                                                        </div>
                                                    </Link>
                                                )) : (
                                                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
                                                        No high-profile candidates tracked yet.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB: DEMOGRAPHICS */}
                                {activeTab === 'demographics' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                        {/* Social Groups Chart */}
                                        <div className="h-48 relative">
                                             <h4 className="text-xs font-bold text-center text-slate-400 uppercase mb-2">Caste / Community Split</h4>
                                             <ResponsiveContainer width="100%" height="100%">
                                                 <PieChart>
                                                     <Pie 
                                                         data={stats.socialGroups} 
                                                         innerRadius={50} 
                                                         outerRadius={70} 
                                                         paddingAngle={2} 
                                                         dataKey="value"
                                                     >
                                                         {stats.socialGroups.map((entry, index) => (
                                                             <Cell key={`cell-${index}`} fill={entry.color} />
                                                         ))}
                                                     </Pie>
                                                     <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                                     <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                                                 </PieChart>
                                             </ResponsiveContainer>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                                    <Briefcase size={16} />
                                                    <span className="text-xs font-bold uppercase">Avg Income</span>
                                                </div>
                                                <p className="text-xl font-black text-emerald-900">{stats.gdpPerCapita}</p>
                                            </div>
                                            
                                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                                <div className="flex items-center gap-2 mb-2 text-indigo-700">
                                                    <Users size={16} />
                                                    <span className="text-xs font-bold uppercase">Urban Pop</span>
                                                </div>
                                                <p className="text-xl font-black text-indigo-900">{stats.urbanRural[0].value}%</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TAB: HISTORY */}
                                {activeTab === 'history' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <div className="h-64 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Voter Turnout Trend (15 Years)</h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.turnoutTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                    <XAxis dataKey="year" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} width={30} />
                                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                                                    <Line type="monotone" dataKey="turnout" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-slate-300">
                                            <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                                <History size={16} className="text-blue-400" /> Historical Context
                                            </h4>
                                            <p className="text-xs leading-relaxed">
                                                {stats.id} has historically been a {stats.swingFactor === 'High' ? 'volatile battleground' : 'stable stronghold'}. 
                                                Voter turnout has consistently {stats.turnoutTrend[3].turnout > stats.turnoutTrend[0].turnout ? 'increased' : 'fluctuated'} over the last three cycles, 
                                                indicating {stats.turnoutTrend[3].turnout > 65 ? 'high political engagement.' : 'moderate civic participation.'}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
           </div>

        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const KPIBox = ({ label, value, color }: { label: string, value: string, color: 'blue'|'purple'|'emerald' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-700',
        purple: 'bg-purple-50 text-purple-700',
        emerald: 'bg-emerald-50 text-emerald-700'
    }
    return (
        <div className={`p-3 rounded-xl ${colors[color]} text-center`}>
            <p className="text-[10px] font-bold uppercase opacity-70 mb-1">{label}</p>
            <p className="text-lg font-black leading-none">{value}</p>
        </div>
    )
}

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button 
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
        }`}
    >
        {icon} {label}
    </button>
)

// --- HEX MAP (Responsive & Interactive) ---
const IndiaHexMap = ({ onSelectState, selectedState }: { onSelectState: (s: string) => void, selectedState: string | null }) => {
  // Define Hex Grid (Simplified representation of India)
  const hexes = [
    { id: "Jammu and Kashmir", r: 1, c: 3 },
    { id: "Punjab", r: 2, c: 2 },
    { id: "Himachal Pradesh", r: 2, c: 3 },
    { id: "Uttarakhand", r: 2, c: 4 },
    { id: "Rajasthan", r: 3, c: 1 },
    { id: "Haryana", r: 3, c: 2 },
    { id: "Delhi", r: 3, c: 3, small: true },
    { id: "Uttar Pradesh", r: 3, c: 4 },
    { id: "Bihar", r: 3, c: 5 },
    { id: "Sikkim", r: 3, c: 6 },
    { id: "Gujarat", r: 4, c: 1 },
    { id: "Madhya Pradesh", r: 4, c: 3 },
    { id: "Chhattisgarh", r: 4, c: 4 },
    { id: "Jharkhand", r: 4, c: 5 },
    { id: "West Bengal", r: 4, c: 6 },
    { id: "Assam", r: 4, c: 7 },
    { id: "Arunachal Pradesh", r: 4, c: 8 },
    { id: "Maharashtra", r: 5, c: 2 },
    { id: "Odisha", r: 5, c: 5 },
    { id: "Telangana", r: 6, c: 3 },
    { id: "Andhra Pradesh", r: 6, c: 4 },
    { id: "Karnataka", r: 7, c: 2 },
    { id: "Kerala", r: 8, c: 2 },
    { id: "Tamil Nadu", r: 8, c: 3 },
    { id: "Goa", r: 6, c: 1, small: true },
    { id: "Tripura", r: 5, c: 7 },
    { id: "Meghalaya", r: 5, c: 6, small: true },
    { id: "Manipur", r: 5, c: 8 },
    { id: "Mizoram", r: 6, c: 8 },
    { id: "Nagaland", r: 4, c: 9, small: true },
  ];

  return (
    <div className="relative w-full h-full overflow-auto flex items-center justify-center min-h-[500px]">
      <div className="relative w-[600px] h-[600px] scale-[0.6] md:scale-90 lg:scale-100 transition-transform origin-center">
         {hexes.map((hex) => {
            const xBase = 60;
            const yBase = 55;
            const x = (hex.c - 1) * xBase * 1.1 + (hex.r % 2 === 0 ? xBase * 0.5 : 0);
            const y = (hex.r - 1) * yBase;
            const isSelected = selectedState === hex.id;
            
            // Determine color based on volatility/selection
            const stats = FULL_INDIA_DATA[hex.id];
            const isSwing = stats?.swingFactor === 'High';
            const isSafe = stats?.swingFactor === 'Safe';

            let baseColor = 'bg-slate-200 text-slate-500 group-hover:bg-blue-200';
            if (isSwing) baseColor = 'bg-orange-200 text-orange-800 group-hover:bg-orange-300';
            if (isSafe) baseColor = 'bg-slate-300 text-slate-600 group-hover:bg-slate-400';
            if (isSelected) baseColor = 'bg-blue-600 text-white shadow-xl shadow-blue-500/40 scale-110 z-50';

            return (
              <motion.div
                key={hex.id}
                onClick={() => onSelectState(hex.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: hex.r * 0.05 + hex.c * 0.05 }}
                className={`absolute cursor-pointer transition-all duration-300 group z-10 hover:z-40
                   ${hex.small ? 'w-10 h-10' : 'w-20 h-20'}
                   flex items-center justify-center text-center p-1
                `}
                style={{ left: x, top: y }}
              >
                 <div className={`
                    w-full h-full flex items-center justify-center clip-hex transition-all duration-300 shadow-sm border-b-2 border-black/5
                    ${baseColor}
                 `}>
                    <span className={`font-bold leading-tight pointer-events-none select-none px-1
                       ${hex.small ? 'text-[7px]' : 'text-[9px]'}
                    `}>
                      {hex.small ? hex.id.substring(0,2).toUpperCase() : hex.id}
                    </span>
                 </div>
              </motion.div>
            );
         })}
      </div>
      <style>{`.clip-hex { clip-path: polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%); }`}</style>
    </div>
  );
};

export default ConstituencyMaps;
