
import React from 'react';
import { Politician } from '../../types';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, ThumbsDown, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../ImageWithFallback';

interface Props {
    politicians: Politician[];
    isLoading?: boolean;
}

const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col items-center animate-pulse">
        <div className="w-16 h-16 rounded-full bg-slate-200 mb-3" />
        <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-16 mb-3" />
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1" />
        <div className="h-3 bg-slate-100 rounded w-12" />
    </div>
);

const SkeletonRow: React.FC = () => (
    <div className="p-4 flex items-center gap-4 animate-pulse">
        <div className="w-6 h-4 bg-slate-200 rounded" />
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div className="flex-grow">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-24" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-12" />
    </div>
);

const EmptyState: React.FC = () => (
    <div className="py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">No Politicians Found</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
            We're still gathering data. Check back soon or try a different state filter.
        </p>
    </div>
);

const ReverseLeaderboard: React.FC<Props> = ({ politicians, isLoading = false }) => {
    const sorted = [...politicians].sort((a, b) => a.approvalRating - b.approvalRating);
    const topWorst = sorted.slice(0, 3);
    const rest = sorted.slice(3, 8);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Needs Improvement
                    </h3>
                </div>
                <div className="grid grid-cols-3 gap-4 items-end">
                    {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
                <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                        Loading...
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (politicians.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" /> Needs Improvement
                </h3>
                <Link to="/rankings?sort=worst" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                    View All <ArrowRight size={12}/>
                </Link>
            </div>

            {/* The Podium of Shame (Top 3 Worst) */}
            <div className="grid grid-cols-3 gap-4 items-end">
                {topWorst.map((p, i) => {
                    return (
                        <Link key={p.id} to={`/politician/${p.slug}`}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative bg-white rounded-2xl border shadow-sm p-4 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all ${i === 0 ? 'border-red-200 bg-red-50/30 scale-105 z-10' : 'border-slate-100'}`}
                            >
                                {i === 0 && <div className="absolute -top-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">Lowest Rated</div>}
                                
                                <div className="w-16 h-16 rounded-full p-1 bg-white shadow-md mb-3 overflow-hidden">
                                    <ImageWithFallback src={p.photoUrl} alt={p.name} className="w-full h-full object-cover rounded-full" />
                                </div>
                                
                                <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 mb-1 group-hover:text-blue-600">{p.name}</h4>
                                <p className="text-[10px] text-slate-500 font-medium mb-3">{p.party}</p>
                            
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1">
                                <div className="h-full bg-red-500" style={{ width: `${p.approvalRating}%` }}></div>
                            </div>
                            <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                                <ThumbsDown size={10} /> {p.approvalRating}%
                            </div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            {/* The Climbing List */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                    Trending Upwards
                </div>
                <div className="divide-y divide-slate-100">
                    {rest.map((p, i) => (
                        <Link key={p.id} to={`/politician/${p.slug}`} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                            <span className="text-slate-400 font-bold text-sm">#{i + 4}</span>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <ImageWithFallback src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-grow">
                                <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{p.name}</h5>
                                <p className="text-xs text-slate-500">{p.constituency}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-sm font-black ${p.approvalRating > 50 ? 'text-green-600' : 'text-orange-500'}`}>{p.approvalRating}%</span>
                                <div className="text-[9px] text-slate-400 flex items-center justify-end gap-1">
                                    <TrendingUp size={8} /> Approval
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReverseLeaderboard;
