import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Politician } from '../../types';
import ImageWithFallback from '../ImageWithFallback';
import { getPoliticians } from '../../services/apiService';

interface Props {
  onSelect: (politician: Politician) => void;
  excludeIds?: number[];
}

const AddPoliticianSearch: React.FC<Props> = ({ onSelect, excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<Politician[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getPoliticians({ search: debouncedQuery });
        // Handle different response structures if needed (e.g. { data: [...] })
        const politicians = Array.isArray(data) ? data : (data.data || []);
        
        // Filter out already selected politicians
        const filtered = politicians.filter((p: Politician) => !excludeIds.includes(p.id));
        setResults(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to search politicians:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, excludeIds]);

  // Close dropdown when clicking outside
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
    onSelect(p);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm hover:shadow-md"
          placeholder="Add politician to compare..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-500">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-80 overflow-y-auto overflow-x-hidden">
          <ul className="py-1 divide-y divide-slate-50">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => handleSelect(p)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                    <ImageWithFallback 
                      src={p.photoUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      {p.party} • {p.constituency}
                    </div>
                  </div>
                  <div className="ml-auto text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={16} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && query && !loading && results.length === 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 p-4 text-center">
            <p className="text-slate-500 text-sm">No politicians found matching "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default AddPoliticianSearch;
