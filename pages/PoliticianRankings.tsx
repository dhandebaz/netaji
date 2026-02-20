
import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { getAllPoliticians, getStates, dataSyncEvents, syncPoliticiansWithBackend } from '../services/dataService';
import { getPoliticians } from '../services/apiService';
import { SortOption, Politician } from '../types';
import PoliticianBubble from '../components/PoliticianBubble';
import { motion } from 'framer-motion';
import { useDebounce } from '../hooks/useDebounce';
import { Helmet } from 'react-helmet-async';

const PoliticianRankings: React.FC = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.BEST_APPROVAL);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const STATES = getStates();

  // Initial load and sync
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      // Load from local cache first for instant render
      const cached = getAllPoliticians();
      if (cached.length > 0) setPoliticians(cached);
      
      // Sync with backend
      await syncPoliticiansWithBackend();
      setLoading(false);
    };
    loadInitial();

    // Listen for real-time updates
    const unsubscribe = dataSyncEvents.on('politiciansUpdated', (updated: Politician[]) => {
      // Only update if we are not actively searching/filtering on server
      if (!debouncedSearch && !selectedState) {
        setPoliticians(updated);
      }
    });

    return () => {
       // @ts-ignore
       if (window.removeEventListener) window.removeEventListener('neta:politiciansUpdated', unsubscribe as any);
       // dataSyncEvents.off is not exposed? Assuming dataSyncEvents is EventEmitter
    };
  }, []);

  // Server-side Search & Filter
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedState) params.state = selectedState;
        
        // Map sort option to API sort param
        let sortParam = 'approval';
        if (sortOption === SortOption.MOST_ASSETS) sortParam = 'assets';
        if (sortOption === SortOption.MOST_CRIMINAL) sortParam = 'cases';
        
        params.sort = sortParam;

        const data = await getPoliticians(params);
        if (data) {
          const results = Array.isArray(data) ? data : (data.data || []);
          setPoliticians(results);
        }
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFiltered();
    
  }, [debouncedSearch, selectedState, sortOption]);

  const canonicalUrl = 'https://neta.ink/rankings';

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 md:px-8 font-sans">
      <Helmet>
        <title>Leaderboard – Politician Rankings | Neta</title>
        <meta
          name="description"
          content="Leaderboard of Indian politicians ranked by approval, assets, and criminal cases with live public sentiment."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Leaderboard – Politician Rankings | Neta" />
        <meta
          property="og:description"
          content="Compare representatives by approval rating, assets, and criminal records using real-time public sentiment."
        />
        <meta property="og:url" content={canonicalUrl} />
      </Helmet>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
           <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                 Leaderboard
              </h1>
              <p className="text-slate-500 font-medium max-w-xl">
                 Track performance, transparency, and public sentiment across the political spectrum.
              </p>
           </div>
           <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Rankings
           </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center sticky top-24 z-30">
            
            {/* Search */}
            <div className="relative flex-grow w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search politician, party, or constituency..." 
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-200 outline-none font-medium transition-all text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                <div className="relative shrink-0">
                    <select 
                        className="appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer transition-colors border border-transparent focus:border-slate-200"
                        value={selectedState}
                        onChange={e => setSelectedState(e.target.value)}
                    >
                        <option value="">All States</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>

                <div className="relative shrink-0">
                    <select 
                        className="appearance-none bg-slate-50 hover:bg-slate-100 pl-4 pr-10 py-3 rounded-xl text-sm font-bold text-slate-600 outline-none cursor-pointer transition-colors border border-transparent focus:border-slate-200"
                        value={sortOption}
                        onChange={e => setSortOption(e.target.value as SortOption)}
                    >
                        <option value={SortOption.BEST_APPROVAL}>Highest Rated</option>
                        <option value={SortOption.WORST_APPROVAL}>Lowest Rated</option>
                        <option value={SortOption.MOST_ASSETS}>Most Assets</option>
                        <option value={SortOption.MOST_CRIMINAL}>Most Criminal Cases</option>
                    </select>
                    <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
            </div>
        </div>

        {/* Grid */}
        <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10"
        >
            {loading ? (
                <div className="col-span-full text-center py-20 text-slate-400">Loading...</div>
            ) : politicians.length > 0 ? (
                politicians.map((p, i) => (
                    <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            {/* Rank Badge */}
                            <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md z-10 ${
                                i === 0 ? 'bg-yellow-500' : 
                                i === 1 ? 'bg-slate-400' : 
                                i === 2 ? 'bg-orange-400' : 'bg-slate-900'
                            }`}>
                                #{i + 1}
                            </div>
                            <PoliticianBubble politician={p} />
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="col-span-full text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Search size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No profiles match your criteria.</p>
                    <button 
                        onClick={() => { setSearchTerm(''); setSelectedState(''); }}
                        className="mt-4 text-blue-600 font-bold hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </motion.div>
      </div>
    </div>
  );
};

export default PoliticianRankings;
