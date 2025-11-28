
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Rss, ExternalLink } from 'lucide-react';
import { getRSSSources, toggleRSSSource, addRSSSource, removeRSSSource } from '../../../services/rssService';
import { RSSSource } from '../../../types';

const PipelineRSS: React.FC = () => {
    const [sources, setSources] = useState<RSSSource[]>([]);
    const [newFeed, setNewFeed] = useState({ name: '', url: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setSources(getRSSSources());
    }, []);

    const handleToggle = (id: string) => {
        setSources(toggleRSSSource(id));
    };

    const handleDelete = (id: string) => {
        if (confirm('Remove this feed?')) {
            setSources(removeRSSSource(id));
        }
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFeed.name && newFeed.url) {
            setSources(addRSSSource(newFeed.name, newFeed.url));
            setNewFeed({ name: '', url: '' });
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">RSS Feed Network</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                    <Plus size={16} /> Add Feed
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2">
                    <h4 className="font-bold text-slate-700 mb-3 text-sm">New Source Details</h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input 
                            type="text" 
                            placeholder="Source Name (e.g. The Hindu)" 
                            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                            value={newFeed.name}
                            onChange={e => setNewFeed({...newFeed, name: e.target.value})}
                            required
                        />
                        <input 
                            type="url" 
                            placeholder="RSS Feed URL" 
                            className="px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            value={newFeed.url}
                            onChange={e => setNewFeed({...newFeed, url: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700">Save Source</button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {sources.map(source => (
                    <div key={source.id} className={`bg-white p-5 rounded-2xl border transition-all flex items-center justify-between ${source.enabled ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-70 bg-slate-50'}`}>
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`p-3 rounded-xl shrink-0 ${source.enabled ? 'bg-orange-100 text-orange-600' : 'bg-slate-200 text-slate-400'}`}>
                                <Rss size={20} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-bold text-slate-900 text-sm truncate">{source.name}</h4>
                                <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-blue-500 hover:underline flex items-center gap-1 truncate">
                                    {source.url} <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <Toggle checked={source.enabled} onChange={() => handleToggle(source.id)} />
                            <button onClick={() => handleDelete(source.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {sources.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium border-2 border-dashed border-slate-200 rounded-2xl">
                        No RSS feeds configured. Add one to start ingesting news.
                    </div>
                )}
            </div>
        </div>
    );
};

const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
            checked ? 'bg-green-500' : 'bg-slate-300'
        }`}
    >
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export default PipelineRSS;
