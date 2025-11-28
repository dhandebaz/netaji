
import React, { useState } from 'react';
import { Play, Pause, Settings, Globe, Database, Clock, AlertTriangle, X, Save, Code, RefreshCw, ChevronRight, Server, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScraperConfig {
    id: number;
    name: string;
    source: string;
    url: string;
    status: 'active' | 'paused';
    lastRun: string;
    interval: string;
    type: 'web' | 'db';
    rules: string; // JSON string for selectors
    proxyEnabled: boolean;
}

const PipelineScrapers: React.FC = () => {
    const [scrapers, setScrapers] = useState<ScraperConfig[]>([
        { 
            id: 1, 
            name: 'ECI Affidavit Scraper', 
            source: 'Election Commission', 
            url: 'https://affidavit.eci.gov.in',
            status: 'active', 
            lastRun: '2 hours ago', 
            interval: 'Daily', 
            type: 'web',
            rules: '{\n  "candidate": "h2.name",\n  "constituency": ".meta span:nth-child(2)"\n}',
            proxyEnabled: true
        },
        { 
            id: 2, 
            name: 'MyNeta.info Sync', 
            source: 'ADR India', 
            url: 'https://myneta.info',
            status: 'active', 
            lastRun: '4 hours ago', 
            interval: 'Weekly', 
            type: 'db',
            rules: '{\n  "table": "candidates_2024",\n  "sync_mode": "incremental"\n}',
            proxyEnabled: false
        },
        { 
            id: 3, 
            name: 'Lok Sabha Questions', 
            source: 'loksabha.nic.in', 
            url: 'https://loksabha.nic.in/questions/qsearch15.aspx',
            status: 'paused', 
            lastRun: '2 days ago', 
            interval: 'Daily', 
            type: 'web',
            rules: '{\n  "question_list": "#qtbl tr",\n  "date": ".date-col"\n}',
            proxyEnabled: true
        },
    ]);

    const [selectedScraper, setSelectedScraper] = useState<ScraperConfig | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'rules' | 'network'>('general');

    const toggleStatus = (id: number) => {
        setScrapers(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } : s));
    };

    const handleSave = () => {
        if (selectedScraper) {
            if (selectedScraper.id === 0) {
                // Create new
                const newId = Math.max(...scrapers.map(s => s.id)) + 1;
                setScrapers([...scrapers, { ...selectedScraper, id: newId, lastRun: 'Never' }]);
            } else {
                // Update existing
                setScrapers(prev => prev.map(s => s.id === selectedScraper.id ? selectedScraper : s));
            }
            setSelectedScraper(null);
        }
    };

    const handleAddNew = () => {
        setSelectedScraper({
            id: 0,
            name: 'New Source Scraper',
            source: 'Unknown Source',
            url: 'https://',
            status: 'paused',
            lastRun: 'Never',
            interval: 'Daily',
            type: 'web',
            rules: '{\n  "target": "css_selector"\n}',
            proxyEnabled: true
        });
        setActiveTab('general');
    };

    return (
        <div className="space-y-6 relative min-h-[500px]">
            
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Source Managers</h3>
                <button 
                    onClick={handleAddNew}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
                >
                    Add New Scraper
                </button>
            </div>

            {/* List Grid */}
            <div className="grid gap-4">
                {scrapers.map(scraper => (
                    <div key={scraper.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-2xl shrink-0 ${scraper.type === 'web' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {scraper.type === 'web' ? <Globe size={24} /> : <Database size={24} />}
                        </div>
                        
                        <div className="flex-grow text-center md:text-left w-full">
                            <h4 className="font-bold text-slate-900 text-lg">{scraper.name}</h4>
                            <p className="text-slate-500 text-sm font-medium">{scraper.source}</p>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-xs font-bold text-slate-400">
                                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded"><Clock size={12}/> {scraper.interval}</span>
                                <span className="bg-slate-50 px-2 py-1 rounded">Last Run: {scraper.lastRun}</span>
                                {scraper.proxyEnabled && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded"><Shield size={10}/> Proxy Active</span>}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 ${
                                scraper.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${scraper.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                {scraper.status}
                            </div>
                            
                            <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block"></div>

                            <button 
                                onClick={() => toggleStatus(scraper.id)}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 border border-transparent hover:border-slate-200 transition-all"
                                title={scraper.status === 'active' ? "Pause" : "Resume"}
                            >
                                {scraper.status === 'active' ? <Pause size={20} /> : <Play size={20} />}
                            </button>
                            <button 
                                onClick={() => setSelectedScraper(scraper)}
                                className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-slate-600 border border-transparent hover:border-blue-200 transition-all" 
                                title="Configure"
                            >
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Policy Note */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-orange-600 mt-0.5" size={20} />
                <div>
                    <h5 className="font-bold text-orange-900 text-sm">Scraping Ethics Policy</h5>
                    <p className="text-xs text-orange-800 mt-1">
                        Ensure all configured scrapers respect <code>robots.txt</code> and implement generous rate limiting (min 2s delay) to avoid IP bans from government servers.
                    </p>
                </div>
            </div>

            {/* SETTINGS SLIDE-OVER PANEL */}
            <AnimatePresence>
                {selectedScraper && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedScraper(null)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-[500px] max-w-[90vw] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col"
                        >
                            {/* Panel Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="font-black text-xl text-slate-900">Configure Source</h2>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{selectedScraper.id === 0 ? 'New Configuration' : `ID: SCR-${selectedScraper.id}`}</p>
                                </div>
                                <button onClick={() => setSelectedScraper(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 px-6">
                                <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} label="General" icon={<Settings size={14}/>} />
                                <TabButton active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} label="Extraction Rules" icon={<Code size={14}/>} />
                                <TabButton active={activeTab === 'network'} onClick={() => setActiveTab('network')} label="Network" icon={<Server size={14}/>} />
                            </div>
                            
                            {/* Panel Content */}
                            <div className="flex-grow overflow-y-auto p-8 space-y-6">
                                {activeTab === 'general' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Scraper Name</label>
                                            <input 
                                                type="text" 
                                                value={selectedScraper.name}
                                                onChange={e => setSelectedScraper({...selectedScraper, name: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target URL / Endpoint</label>
                                            <input 
                                                type="text" 
                                                value={selectedScraper.url}
                                                onChange={e => setSelectedScraper({...selectedScraper, url: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs text-blue-600 bg-blue-50/50"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Source Type</label>
                                                <select 
                                                    value={selectedScraper.type}
                                                    onChange={e => setSelectedScraper({...selectedScraper, type: e.target.value as any})}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                >
                                                    <option value="web">Web Scraper (HTML)</option>
                                                    <option value="db">Database Sync</option>
                                                    <option value="api">JSON API</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Schedule</label>
                                                <select 
                                                    value={selectedScraper.interval}
                                                    onChange={e => setSelectedScraper({...selectedScraper, interval: e.target.value})}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                >
                                                    <option value="Hourly">Hourly</option>
                                                    <option value="Daily">Daily (Midnight)</option>
                                                    <option value="Weekly">Weekly (Sun)</option>
                                                    <option value="Manual">Manual Only</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Source Organization</label>
                                            <input 
                                                type="text" 
                                                value={selectedScraper.source}
                                                onChange={e => setSelectedScraper({...selectedScraper, source: e.target.value})}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'rules' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800">
                                            <p className="font-bold mb-1">Selector Configuration</p>
                                            Define CSS selectors or JSON paths to map source data to the standardized Neta schema.
                                        </div>
                                        <div className="flex-grow relative">
                                            <textarea 
                                                value={selectedScraper.rules}
                                                onChange={e => setSelectedScraper({...selectedScraper, rules: e.target.value})}
                                                className="w-full h-[350px] bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl outline-none resize-none shadow-inner"
                                                spellCheck={false}
                                            />
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-[10px] font-bold text-slate-400 uppercase">JSON</div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'network' && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                                        <Shield size={16} className="text-green-600" /> Proxy Rotation
                                                    </h4>
                                                    <p className="text-xs text-slate-500">Route requests through residential proxies.</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedScraper({...selectedScraper, proxyEnabled: !selectedScraper.proxyEnabled})}
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${selectedScraper.proxyEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${selectedScraper.proxyEnabled ? 'translate-x-6' : ''}`} />
                                                </button>
                                            </div>
                                            {selectedScraper.proxyEnabled && (
                                                <div className="bg-green-50 px-3 py-2 rounded-lg text-xs text-green-800 font-medium border border-green-100">
                                                    Using Pool: <b>Asia-Pacific-Res-1</b> (48 IPs)
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">Rate Limiting (ms)</label>
                                            <input 
                                                type="number" 
                                                defaultValue={2000}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <p className="text-[10px] text-slate-400">Minimum delay between subsequent requests.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-xs font-bold text-slate-500 uppercase">User Agent Strategy</label>
                                            <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                                                <option>Rotate Desktop (Chrome/Firefox)</option>
                                                <option>Rotate Mobile</option>
                                                <option>Google Bot (Use with caution)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                                <button className="text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                                    Delete Scraper
                                </button>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => {
                                            // Mock Test
                                            alert("Running dry-run test on target...");
                                        }}
                                        className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                                    >
                                        <RefreshCw size={14} /> Test Run
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Save size={16} /> Save Config
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

const TabButton = ({ active, onClick, label, icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
            active 
            ? 'border-blue-600 text-blue-600' 
            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
        }`}
    >
        {icon} {label}
    </button>
);

export default PipelineScrapers;
