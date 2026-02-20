import React, { useState, useEffect } from 'react';
import { RefreshCw, Globe, Database, Rss, FileText, Check, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { fetchRealDataFromBackend } from '../../../services/dataService';

interface Props {
    onNavigate: (page: 'overview' | 'scrapers' | 'rss' | 'logs') => void;
}

interface Config {
  key: string;
  label: string;
}

const PipelineOverview: React.FC<Props> = ({ onNavigate }) => {
  const [isScraperRunning, setIsScraperRunning] = useState(false);
  const [scraperStatus, setScraperStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [scraperMessage, setScraperMessage] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [availableStates, setAvailableStates] = useState<Config[]>([]);

  useEffect(() => {
    setAvailableStates([
      { key: 'all', label: 'All India – Top Leaders' },
      { key: 'Uttar Pradesh', label: 'Uttar Pradesh' },
      { key: 'Delhi', label: 'Delhi' },
      { key: 'Kerala', label: 'Kerala' },
      { key: 'West Bengal', label: 'West Bengal' }
    ]);
    setSelectedState('all');
  }, []);

  const handleRunScraper = async () => {
    setIsScraperRunning(true);
    setScraperStatus('running');
    setScraperMessage(`🔍 Scraping politicians from ${selectedState}...`);
    
    try {
      const success = await fetchRealDataFromBackend(selectedState);
      if (success) {
        setScraperStatus('success');
        setScraperMessage(`✅ Scrape complete! Politicians from ${selectedState} loaded to homepage.`);
        setTimeout(() => {
          setScraperStatus('idle');
          setScraperMessage('');
        }, 5000);
      } else {
        setScraperStatus('error');
        setScraperMessage('❌ Scraper failed. Check backend logs.');
      }
    } catch (error) {
      setScraperStatus('error');
      setScraperMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScraperRunning(false);
    }
  };

  return (
    <div className="space-y-8">
       {/* MAIN SCRAPER BUTTON */}
       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-lg shadow-blue-500/30">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
           <div className="flex-1">
             <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
               <Zap size={28} /> Politician Data Scraper
             </h2>
             <p className="text-blue-100 text-sm font-medium">
               Fetch REAL politician data from MyNeta.info - actual criminal cases, assets, and profiles.
             </p>
           </div>
           <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
             <select
               value={selectedState}
               onChange={(e) => setSelectedState(e.target.value)}
               disabled={isScraperRunning}
               className="px-4 py-2 rounded-xl font-bold text-sm bg-white text-slate-900 border-2 border-white disabled:opacity-70 focus:outline-none"
             >
               {availableStates.length === 0 ? (
                 <option value="LokSabha2024">Lok Sabha 2024</option>
               ) : (
                 availableStates.map(c => (
                   <option key={c.key} value={c.key}>{c.label}</option>
                 ))
               )}
             </select>
             <button 
               onClick={handleRunScraper}
               disabled={isScraperRunning}
               className="bg-white text-blue-600 px-8 py-2 rounded-xl font-bold text-base hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-xl active:scale-95 whitespace-nowrap"
             >
                <RefreshCw size={20} className={isScraperRunning ? 'animate-spin' : ''} />
                {isScraperRunning ? 'Scraping...' : 'Run Scraper'}
             </button>
           </div>
         </div>

         {/* Status Message */}
         {scraperMessage && (
           <div className={`mt-6 p-4 rounded-xl font-bold text-sm flex items-center gap-2 ${
             scraperStatus === 'success' ? 'bg-white/20 text-white border border-white/30' :
             scraperStatus === 'error' ? 'bg-red-500/30 text-white border border-red-400/50' :
             'bg-white/20 text-white border border-white/30'
           }`}>
             {scraperStatus === 'success' && <Check size={18} className="flex-shrink-0" />}
             {scraperStatus === 'error' && <AlertCircle size={18} className="flex-shrink-0" />}
             {scraperStatus === 'running' && <RefreshCw size={18} className="animate-spin flex-shrink-0" />}
             {scraperMessage}
           </div>
         )}
       </div>

       {/* Quick Status Cards */}
       <div className="grid md:grid-cols-3 gap-6">
           <div 
                onClick={() => onNavigate('scrapers')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
           >
               <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                       <Globe size={24} />
                   </div>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
               </div>
               <h3 className="font-bold text-slate-900 text-lg">Source Config</h3>
               <p className="text-sm text-slate-500 mt-1">2 Active, 1 Paused</p>
               <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 w-[70%]"></div>
               </div>
           </div>

           <div 
                onClick={() => onNavigate('rss')}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
           >
               <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                       <Rss size={24} />
                   </div>
                   <ArrowRight size={16} className="text-slate-300 group-hover:text-orange-500" />
               </div>
               <h3 className="font-bold text-slate-900 text-lg">RSS Feeds</h3>
               <p className="text-sm text-slate-500 mt-1">4 Sources Connected</p>
               <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-orange-500 w-[100%]"></div>
               </div>
           </div>

           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                       <Database size={24} />
                   </div>
                   <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded">99.9% Uptime</span>
               </div>
               <h3 className="font-bold text-slate-900 text-lg">Data Storage</h3>
               <p className="text-sm text-slate-500 mt-1">4.2GB / 5.0GB Used</p>
               <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 w-[84%]"></div>
               </div>
           </div>
       </div>

       {/* Recent Activity */}
       <div className="bg-white rounded-[24px] p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={18} /> Recent Scraper Logs
              </h3>
              <button onClick={() => onNavigate('logs')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
          </div>
          <div className="space-y-2">
             <LogEntry time="Now" type="success" msg="Real data scraper working. 6 politicians loaded with Wikipedia photos." />
             <LogEntry time="Earlier" type="info" msg="Auto-refresh scheduler active. Will update every 60 minutes." />
             <LogEntry time="Earlier" type="success" msg="Backend API initialized with real politician database." />
             <LogEntry time="Earlier" type="info" msg="System ready for manual or automatic politician data updates." />
          </div>
       </div>
    </div>
  );
};

const LogEntry = ({ time, type, msg }: any) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
     <span className="text-slate-400 shrink-0 w-20 font-mono text-xs pt-1">{time}</span>
     <div className="pt-1">
        {type === 'success' && <Check size={14} className="text-green-500" />}
        {type === 'error' && <AlertCircle size={14} className="text-red-500" />}
        {type === 'info' && <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400"></div>}
     </div>
     <span className="text-slate-700 text-sm font-medium">{msg}</span>
  </div>
);

export default PipelineOverview;
