'use client';

import React from 'react';
import { FileText, Zap, TrendingUp, AlertTriangle, ShieldCheck, Megaphone, CheckCircle, Clock, Heart, Gavel, Link as LinkIcon, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Politician, NewsItem } from '../../types';
import { PoliticianInsights } from '../../services/geminiService';

interface Props {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    politician: Politician;
    insights: PoliticianInsights | null;
    loadingInsights: boolean;
    news: NewsItem[];
    loadingNews: boolean;
    myNetaUrl: string | null;
}

const ProfileTabs: React.FC<Props> = ({ 
    activeTab, setActiveTab, politician, insights, loadingInsights, news, loadingNews, myNetaUrl 
}) => {
    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 min-h-[600px] overflow-hidden">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 overflow-x-auto no-scrollbar p-1">
                <div className="flex p-2 gap-2 min-w-max">
                    {['Overview', 'Official Updates', 'Financial', 'Electoral', 'Criminal', 'News'].map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 ${
                        activeTab === tab 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {tab}
                    </button>
                    ))}
                </div>
            </div>

            <div className="p-6 md:p-8">
                {activeTab === 'Financial' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Assets Breakdown</h3>
                    <div className="h-80 w-full mb-8 bg-slate-50 rounded-3xl p-4 border border-slate-100">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={politician.assetsBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis hide />
                            <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                            <Legend />
                            <Bar dataKey="movable" name="Movable (Cr)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="immovable" name="Immovable (Cr)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="liabilities" name="Liabilities (Cr)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {myNetaUrl && <SourceLink url={myNetaUrl} />}
                </motion.div>
                )}

                {activeTab === 'Electoral' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Electoral History</h3>
                    <div className="space-y-4">
                        {politician.history && politician.history.length > 0 ? (
                            politician.history.map((h, idx) => (
                                <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <div className="text-2xl font-black text-slate-900">{h.year}</div>
                                        <div className="text-slate-500 font-medium">{h.position}</div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${h.result === 'Won' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {h.result}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-slate-500">No electoral history available</div>
                        )}
                    </div>
                </motion.div>
                )}

                {activeTab === 'Overview' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-8">
                    {loadingInsights ? (
                        <div className="space-y-6">
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                    <div className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
                                    <div className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
                            </div>
                        </div>
                    ) : insights ? (
                        <>
                            <div className="bg-gradient-to-br from-blue-50 to-violet-50 p-6 rounded-3xl border border-blue-100">
                                <h3 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1"><FileText size={14}/> Executive Summary</h3>
                                <p className="text-slate-800 text-lg leading-relaxed font-medium mb-4">{insights.biography}</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg text-xs font-bold text-slate-600 border border-blue-100 shadow-sm">
                                    <Zap size={12} className="text-yellow-500 fill-yellow-500" /> 
                                    Ideology: {insights.ideology}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">SWOT Analysis</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SWOTCard title="Strengths" items={insights.swot.strengths} color="green" icon={<TrendingUp />} />
                                    <SWOTCard title="Weaknesses" items={insights.swot.weaknesses} color="orange" icon={<AlertTriangle />} />
                                    <SWOTCard title="Opportunities" items={insights.swot.opportunities} color="blue" icon={<Zap />} />
                                    <SWOTCard title="Threats" items={insights.swot.threats} color="red" icon={<ShieldCheck />} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                            <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">AI Insights are currently unavailable.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoTile label="Age" value={`${politician.age} Years`} />
                            <InfoTile label="Education" value={politician.education} />
                    </div>
                </motion.div>
                )}
                
                {activeTab === 'Criminal' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}>
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Legal Status</h3>
                    {politician.criminalCases === 0 ? (
                            <div className="p-8 bg-green-50 rounded-3xl border border-green-100 text-center">
                            <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
                            <h4 className="text-green-900 font-bold text-lg">Clean Record</h4>
                            <p className="text-green-700">No criminal cases declared in latest affidavits.</p>
                            </div>
                    ) : (
                            <div className="p-6 bg-red-50 rounded-3xl border border-red-100 flex gap-4">
                            <div className="bg-red-100 p-3 rounded-xl h-fit"><Gavel className="text-red-600" size={24} /></div>
                            <div>
                                <h4 className="text-red-900 font-bold text-lg">{politician.criminalCases} Cases Pending</h4>
                                <p className="text-red-700 mt-1">Serious charges declared. View full affidavit for details.</p>
                            </div>
                            </div>
                    )}
                </motion.div>
                )}

                {activeTab === 'Official Updates' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-6">
                    {politician.announcements && politician.announcements.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pl-8">
                            {politician.announcements.map((announcement) => (
                                <div key={announcement.id} className="relative">
                                    {/* Timeline dot */}
                                    <div className="absolute -left-[41px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                                        <Megaphone size={10} className="text-white" />
                                    </div>
                                    
                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1 border border-blue-100">
                                                    <CheckCircle size={10} /> Official Update
                                                </span>
                                                <h4 className="text-lg font-bold text-slate-900">{announcement.title}</h4>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                                <Clock size={12} /> {announcement.date}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 leading-relaxed text-sm mb-4">{announcement.content}</p>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                                            <Heart size={14} className="text-red-500 fill-red-500" /> {announcement.likes} Citizen Likes
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <Megaphone className="mx-auto text-slate-300 mb-3" size={32} />
                            <p className="text-slate-500 font-medium">No official announcements yet.</p>
                        </div>
                    )}
                </motion.div>
                )}

                {activeTab === 'News' && (
                <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="space-y-4">
                    {loadingNews ? <div className="p-10 text-center"><div className="loader mx-auto mb-2"></div>Fetching updates...</div> : 
                        news.length > 0 ? news.map(n => (
                            <a key={n.id} href={n.url} target="_blank" className="block p-5 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-md transition-all border border-slate-100 group">
                                <div className="flex justify-between text-xs text-slate-400 font-bold uppercase mb-2">
                                    <span>{n.source}</span>
                                    <span>{n.date}</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">{n.headline}</h4>
                                <p className="text-slate-600 text-sm line-clamp-2">{n.snippet}</p>
                            </a>
                        )) : <p className="text-center text-slate-500 py-10">No recent news found.</p>
                    }
                </motion.div>
                )}
            </div>
        </div>
    );
};

// --- Internal Helper Components ---

const InfoTile = ({ label, value }: any) => (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
);

const SWOTCard = ({ title, items, color, icon }: any) => {
    const colors: Record<string, string> = {
        green: 'bg-emerald-50 border-emerald-100 text-emerald-900',
        red: 'bg-red-50 border-red-100 text-red-900',
        blue: 'bg-blue-50 border-blue-100 text-blue-900',
        orange: 'bg-orange-50 border-orange-100 text-orange-900'
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[color]}`}>
             <div className="flex items-center gap-2 mb-3 font-bold text-sm uppercase tracking-wider opacity-80">
                 {icon} {title}
             </div>
             <ul className="space-y-2">
                 {items.map((item: string, i: number) => (
                     <li key={i} className="text-xs font-bold flex items-start gap-2">
                         <span className="mt-1">•</span> {item}
                     </li>
                 ))}
             </ul>
        </div>
    )
}

const SourceLink = ({ url }: { url: string }) => (
    <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
        <LinkIcon size={16} className="text-blue-500 mt-1 shrink-0" />
        <p className="text-sm text-blue-900">
            Data sourced from Election Commission affidavits. 
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold underline ml-1 hover:text-blue-700">Verify Official Record</a>
        </p>
    </div>
);

export default ProfileTabs;
