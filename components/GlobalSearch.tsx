import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { Politician } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { getPoliticians } from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getPoliticians({ search: debouncedQuery, limit: 5 });
        const politicians = Array.isArray(data) ? data : (data.data || []);
        setResults(politicians);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to search politicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (p: Politician) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/politician/${p.slug}`);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <div className={`relative flex items-center transition-all duration-300 ${isOpen || query ? 'w-64' : 'w-40'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
            </div>
            <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 text-xs font-bold border border-slate-200 rounded-full bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            placeholder="Search neta..."
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value) setIsOpen(true);
            }}
            onFocus={() => {
                if (results.length > 0 || query) setIsOpen(true);
            }}
            />
            {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-500">
                <Loader2 size={14} className="animate-spin" />
            </div>
            )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || (query && !loading)) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
          >
            {results.length > 0 ? (
              <ul className="py-1 divide-y divide-slate-50">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelect(p)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        <ImageWithFallback 
                          src={p.photoUrl} 
                          alt={p.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-xs truncate group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium truncate">
                          {p.party} • {p.constituency}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
                !loading && query && (
                    <div className="p-4 text-center">
                        <p className="text-xs text-slate-500">No politicians found matching "{query}"</p>
                    </div>
                )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
