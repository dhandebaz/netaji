
import React, { useState } from 'react';
import { LayoutDashboard, Database, Rss, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Sub-pages
import PipelineOverview from './pipeline/PipelineOverview';
import PipelineScrapers from './pipeline/PipelineScrapers';
import PipelineRSS from './pipeline/PipelineRSS';
import PipelineLogs from './pipeline/PipelineLogs';

const AdminDataPipeline: React.FC = () => {
    const [activePage, setActivePage] = useState<'overview' | 'scrapers' | 'rss' | 'logs'>('overview');

    return (
        <div className="w-full max-w-7xl mx-auto relative pb-10">
             
             {/* Header & Nav */}
             <div className="mb-8">
                 <h1 className="text-3xl font-black text-slate-900 mb-2">Data Pipeline</h1>
                 <p className="text-slate-500 font-medium mb-6">Manage ingestion sources, scrapers, and data integrity jobs.</p>
                 
                 <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex gap-1">
                     <NavButton 
                        active={activePage === 'overview'} 
                        onClick={() => setActivePage('overview')} 
                        icon={<LayoutDashboard size={16} />}
                        label="Overview"
                     />
                     <NavButton 
                        active={activePage === 'scrapers'} 
                        onClick={() => setActivePage('scrapers')} 
                        icon={<Database size={16} />}
                        label="Source Manager"
                     />
                     <NavButton 
                        active={activePage === 'rss'} 
                        onClick={() => setActivePage('rss')} 
                        icon={<Rss size={16} />}
                        label="RSS Network"
                     />
                     <NavButton 
                        active={activePage === 'logs'} 
                        onClick={() => setActivePage('logs')} 
                        icon={<ScrollText size={16} />}
                        label="System Logs"
                     />
                 </div>
             </div>

             {/* Content Area */}
             <div className="min-h-[500px]">
                 <AnimatePresence mode="wait">
                     <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                     >
                         {activePage === 'overview' && <PipelineOverview onNavigate={setActivePage} />}
                         {activePage === 'scrapers' && <PipelineScrapers />}
                         {activePage === 'rss' && <PipelineRSS />}
                         {activePage === 'logs' && <PipelineLogs />}
                     </motion.div>
                 </AnimatePresence>
             </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            active 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
        {icon} {label}
    </button>
);

export default AdminDataPipeline;
