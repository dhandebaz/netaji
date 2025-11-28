
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { getAllPoliticians, getStates } from '../services/dataService';
import { SortOption, Politician } from '../types';
import PoliticianBubble from '../components/PoliticianBubble';
import { fuzzySearch } from '../services/searchService';
import { motion } from 'framer-motion';

const PoliticianRankings: React.FC = () => {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.BEST_APPROVAL);
  const STATES = getStates();

  useEffect(() => {
    const allPoliticians = getAllPoliticians();
    setPoliticians(allPoliticians);
  }, []);

  const filteredPoliticians = useMemo(() => {
    let result = [...politicians];
    
    // Filter
    if (searchTerm) result = fuzzySearch(result, searchTerm, ['name', 'party', 'constituency']);
    if (selectedState) result = result.filter(p => p.state === selectedState);
    
    // Sort
    switch (sortOption) {
      case SortOption.BEST_APPROVAL: 
        result.sort((a, b) => b.approvalRating - a.approvalRating); 
        break;
      case SortOption.WORST_APPROVAL: 
        result.sort((a, b) => a.approvalRating - b.approvalRating); 
        break;
      case SortOption.MOST_ASSETS: 
        result.sort((a, b) => b.totalAssets - a.totalAssets); 
        break;
      case SortOption.MOST_CRIMINAL: 
        result.sort((a, b) => b.criminalCases - a.criminalCases); 
        break;
      default: break;
    }
    return result;
  }, [searchTerm, selectedState, sortOption]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 md:px-8 font-sans">
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
            {filteredPoliticians.length > 0 ? (
                filteredPoliticians.map((p, i) => (
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
                        className="mt-4 text-blue-600 font-bold text-sm hover:underline"
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
