
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, FileJson, FileSpreadsheet, Terminal, Copy, Check, Shield, Globe, ExternalLink, Search, Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const OpenData: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'datasets' | 'api'>('datasets');

  const handleCopy = () => {
    setCopied(true);
    const key = user?.apiKey || 'YOUR_KEY';
    navigator.clipboard.writeText(`curl -X GET https://api.neta.app/v1/politicians?state=MH -H "Authorization: Bearer ${key}"`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pt-28 pb-20 px-4 md:px-8">
      <Helmet>
        <title>Open Data – Public Transparency Hub | Neta</title>
        <meta
          name="description"
          content="Download structured datasets and use APIs for Indian political data, assets, criminal cases, and RTI responses."
        />
        <link rel="canonical" href="https://neta.ink/open-data" />
        <meta property="og:title" content="Open Data – Public Transparency Hub | Neta" />
        <meta
          property="og:description"
          content="Access cleaned, verified, and structured open data on Indian politics, built for journalists and civic hackers."
        />
        <meta property="og:url" content="https://neta.ink/open-data" />
      </Helmet>
      
      {/* HERO */}
      <section className="max-w-7xl mx-auto mb-16 text-center">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold uppercase tracking-wider mb-6 border border-blue-100"
        >
            <Database size={16} /> Public Transparency Hub
        </motion.div>
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
        >
            Data belongs to the <span className="text-blue-600">People.</span>
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
            Access cleaned, verified, and structured data on Indian politics. 
            Free for journalists, researchers, and civic hackers.
        </motion.p>
      </section>

      {/* TABS */}
      <div className="max-w-6xl mx-auto mb-10">
         <div className="flex justify-center">
             <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex">
                 <button 
                    onClick={() => setActiveTab('datasets')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'datasets' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                 >
                    <Database size={16} /> Datasets
                 </button>
                 <button 
                    onClick={() => setActiveTab('api')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                        activeTab === 'api' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                 >
                    <Terminal size={16} /> API Access
                 </button>
             </div>
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-6xl mx-auto">
         <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
         >
             {activeTab === 'datasets' ? <DatasetCatalog /> : (
                <ApiDocs 
                   handleCopy={handleCopy} 
                   copied={copied} 
                   hasAccess={!!user && (user.role === 'developer' || user.role === 'superadmin')} 
                />
             )}
         </motion.div>
      </div>

      {/* LICENSE INFO */}
      <section className="max-w-4xl mx-auto mt-24 text-center border-t border-slate-200 pt-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4 text-slate-400">
              <Shield size={24} />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">Open Data License</h3>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto">
              All datasets provided here are licensed under <a href="#" className="text-blue-600 underline">Creative Commons Attribution 4.0 International (CC BY 4.0)</a>. 
              You are free to use, adapt, and share this data for any purpose, provided you credit <strong>Neta Foundation</strong>.
          </p>
      </section>
    </div>
  );
};

const DatasetCatalog = () => {
    const datasets = [
        {
            id: 1,
            title: "Lok Sabha 2024 Candidates",
            desc: "Full affidavit data including assets, education, and criminal cases for all 8,000+ candidates.",
            records: "8,360 Records",
            size: "24 MB",
            updated: "June 10, 2024",
            tags: ["Elections", "Affidavits"]
        },
        {
            id: 2,
            title: "Criminal Records Registry",
            desc: "Detailed breakdown of IPC sections and case status for sitting MPs and MLAs across India.",
            records: "4,120 Records",
            size: "12 MB",
            updated: "Aug 15, 2024",
            tags: ["Legal", "Crime"]
        },
        {
            id: 3,
            title: "Asset Growth Index (2009-2024)",
            desc: "Longitudinal study of wealth accumulation for re-elected representatives.",
            records: "2,400 Records",
            size: "18 MB",
            updated: "July 01, 2024",
            tags: ["Financial", "Trends"]
        },
        {
            id: 4,
            title: "RTI Response Archive",
            desc: "Anonymized text of RTI responses received by the Nyay Fauj network.",
            records: "150+ Documents",
            size: "450 MB",
            updated: "Live Sync",
            tags: ["Transparency", "RTI"]
        },
        {
            id: 5,
            title: "Constituency Demographics",
            desc: "Projected caste, religion, and urban/rural splits mapped to delimitation boundaries.",
            records: "543 Constituencies",
            size: "8 MB",
            updated: "Jan 2025",
            tags: ["Census", "Maps"]
        },
        {
            id: 6,
            title: "Parliament Attendance Logs",
            desc: "Session-wise attendance and question hour participation stats.",
            records: "Daily Logs",
            size: "5 MB",
            updated: "Yesterday",
            tags: ["Performance"]
        }
    ];

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-xl">
                            <Database size={20} />
                        </div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-wide">
                            {d.updated}
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{d.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{d.desc}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                        {d.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-500">{t}</span>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="text-xs font-medium text-slate-400">
                            {d.records} • {d.size}
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download JSON">
                                <FileJson size={18} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download CSV">
                                <FileSpreadsheet size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ApiDocs = ({ handleCopy, copied, hasAccess }: { handleCopy: () => void, copied: boolean, hasAccess: boolean }) => {
    return (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Documentation */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Lock size={16} className="text-blue-600"/> Authentication
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        API access requires a valid bearer token. Rate limits apply based on your tier.
                    </p>
                    {hasAccess ? (
                        <div className="p-3 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center gap-2">
                             <Check size={14} /> Developer Access Active
                        </div>
                    ) : (
                        <Link to="/login?tab=signup" className="block text-center w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                            Get API Key
                        </Link>
                    )}
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-purple-600"/> Endpoints
                    </h3>
                    <ul className="space-y-3">
                        <EndpointItem method="GET" path="/v1/politicians" desc="List all tracked representatives" />
                        <EndpointItem method="GET" path="/v1/constituencies/{id}" desc="Get geo-data & demographics" />
                        <EndpointItem method="GET" path="/v1/stats/criminality" desc="Aggregated crime statistics" />
                    </ul>
                </div>
                
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <ExternalLink size={14} />
                    <a href="#" className="hover:underline">View Full Swagger Documentation</a>
                </div>
            </div>

            {/* Code Preview */}
            <div className="lg:col-span-2">
                {hasAccess ? (
                    <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                        <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="ml-3 text-xs font-mono text-slate-400">example_request.sh</span>
                            </div>
                            <button 
                                onClick={handleCopy}
                                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                                {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <div className="p-6 font-mono text-sm overflow-x-auto custom-scrollbar text-blue-100">
                            <div className="leading-relaxed">
                                <span className="text-purple-400">curl</span> <span className="text-yellow-200">-X</span> GET \<br/>
                                &nbsp;&nbsp;<span className="text-green-400">'https://api.neta.app/v1/politicians?state=MH&sort=assets'</span> \<br/>
                                &nbsp;&nbsp;<span className="text-yellow-200">-H</span> <span className="text-orange-300">'Authorization: Bearer YOUR_API_KEY'</span> \<br/>
                                &nbsp;&nbsp;<span className="text-yellow-200">-H</span> <span className="text-orange-300">'Content-Type: application/json'</span>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="text-slate-500 mb-2 text-xs uppercase tracking-wider font-bold">// Response Preview</div>
                                <span className="text-yellow-400">{`{`}</span><br/>
                                &nbsp;&nbsp;<span className="text-blue-300">"count"</span>: <span className="text-green-300">48</span>,<br/>
                                &nbsp;&nbsp;<span className="text-blue-300">"data"</span>: [<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`{`}</span><br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"name"</span>: <span className="text-orange-300">"Candidate A"</span>,<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"constituency"</span>: <span className="text-orange-300">"Mumbai South"</span>,<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"assets_cr"</span>: <span className="text-green-300">145.2</span>,<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">"criminal_cases"</span>: <span className="text-green-300">0</span><br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">{`}`}</span>,<br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">...</span><br/>
                                &nbsp;&nbsp;]<br/>
                                <span className="text-yellow-400">{`}`}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[400px] bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                        <Lock className="text-slate-700 mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-white mb-2">Developer Access Required</h3>
                        <p className="text-slate-400 mb-8 max-w-md">
                            Upgrade to a Developer Plan to access the API playground, generate keys, and view live documentation.
                        </p>
                        <Link to="/login?tab=signup" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                            View Plans <ChevronRight size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

const EndpointItem = ({ method, path, desc }: any) => (
    <li className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase w-12 text-center shrink-0">{method}</span>
        <div className="flex-grow min-w-0">
            <p className="font-mono text-xs font-bold text-slate-700 truncate group-hover:text-blue-600">{path}</p>
            <p className="text-[10px] text-slate-500 truncate">{desc}</p>
        </div>
    </li>
)

export default OpenData;
