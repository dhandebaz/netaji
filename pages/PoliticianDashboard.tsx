
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, Megaphone, FileText, TrendingUp, 
    Users, ThumbsUp, ThumbsDown, Bell, Plus, Check, AlertCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAllPoliticians, getAllRTITasks } from '../services/dataService';
import { motion } from 'framer-motion';
import ComplaintHandler from '../components/politician/ComplaintHandler';
import ImageWithFallback from '../components/ImageWithFallback';

const PoliticianDashboard: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Mock Data for current politician (assuming logged in user maps to a politician)
    const politicians = getAllPoliticians();
    const politician = politicians.find(p => p.name.includes("Akhilesh")) || politicians[0] || {
        id: "demo",
        name: "Demo Politician",
        party: "Independent",
        constituency: "Unknown",
        state: "India",
        photoUrl: "",
        approvalRating: 50,
        votes: { up: 0, down: 0 },
        totalAssets: 0,
        criminalCases: 0
    };
    
    const sentimentData = [
        { date: 'Oct 1', up: 40, down: 20 },
        { date: 'Oct 5', up: 45, down: 25 },
        { date: 'Oct 10', up: 55, down: 22 },
        { date: 'Oct 15', up: 60, down: 30 },
        { date: 'Oct 20', up: 68, down: 28 },
        { date: 'Oct 25', up: 75, down: 35 },
    ];

    const rtiRequests = getAllRTITasks().filter(t => t.politicianId === politician.id || t.politicianName === politician.name);

    if (!user || user.role !== 'representative' && user.role !== 'superadmin') {
        return <div className="min-h-screen flex items-center justify-center">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <ImageWithFallback src={politician.photoUrl} className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500" alt="Profile" />
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Welcome, {politician.name}</h1>
                                <p className="text-slate-500 font-medium text-sm">{politician.designation || 'Member of Parliament'} • {politician.constituency}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <NavButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<LayoutDashboard size={18}/>} label="Overview" />
                        <NavButton active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} icon={<Megaphone size={18}/>} label="Broadcast" />
                        <NavButton active={activeTab === 'rti'} onClick={() => setActiveTab('rti')} icon={<FileText size={18}/>} label="RTI Radar" />
                        <NavButton active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon={<AlertCircle size={18}/>} label="Complaints" />
                    </div>
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && <OverviewTab politician={politician} sentimentData={sentimentData} />}
                    {activeTab === 'broadcast' && <BroadcastTab />}
                    {activeTab === 'rti' && <RTIRadarTab requests={rtiRequests} />}
                    {activeTab === 'complaints' && <ComplaintHandler politicianId={politician.id} />}
                </motion.div>

            </div>
        </div>
    );
};

const OverviewTab = ({ politician, sentimentData }: any) => (
    <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                label="Net Approval" 
                value={`${politician.approvalRating}%`} 
                subValue="+2.4% this week" 
                icon={<TrendingUp className="text-green-600" size={24}/>}
                bg="bg-green-50 border-green-100"
            />
            <StatCard 
                label="Verified Votes" 
                value={(politician.votes.up + politician.votes.down).toLocaleString()} 
                subValue="Citizens engaged" 
                icon={<Users className="text-blue-600" size={24}/>}
                bg="bg-blue-50 border-blue-100"
            />
            <StatCard 
                label="Pending RTIs" 
                value="3" 
                subValue="Requires attention" 
                icon={<AlertCircle className="text-orange-600" size={24}/>}
                bg="bg-orange-50 border-orange-100"
            />
        </div>

        {/* Sentiment Chart */}
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-6">Voter Sentiment Analysis</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sentimentData}>
                        <defs>
                            <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="up" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorUp)" name="Support" />
                        <Area type="monotone" dataKey="down" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDown)" name="Oppose" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

const BroadcastTab = () => {
    const [posted, setPosted] = useState(false);
    const [content, setContent] = useState('');

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        setPosted(true);
        setContent('');
        setTimeout(() => setPosted(false), 3000);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Official Broadcast</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Post updates directly to your profile page. These appear with a "Verified Official" badge.
                    </p>
                    
                    <form onSubmit={handlePost} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Update Title</label>
                            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="e.g. New Project Inauguration" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Message Content</label>
                            <textarea 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[150px] resize-none" 
                                placeholder="Write your message to constituents..." 
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                required
                            ></textarea>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Category</label>
                            <div className="flex gap-3 mt-2">
                                {['Update', 'Event', 'Response', 'Achievement'].map(type => (
                                    <label key={type} className="cursor-pointer">
                                        <input type="radio" name="type" className="peer sr-only" />
                                        <span className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold peer-checked:bg-slate-900 peer-checked:text-white peer-checked:border-slate-900 transition-all inline-block">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            {posted ? <Check size={20} /> : <Megaphone size={20} />}
                            {posted ? 'Broadcast Sent!' : 'Publish Update'}
                        </button>
                    </form>
                </div>
            </div>

            <div>
                <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Bell size={18} /> Recent Activity
                    </h4>
                    <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-200">
                        <div className="pl-6 relative">
                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-blue-100"></div>
                            <p className="text-xs font-bold text-blue-400 mb-1">2 hours ago</p>
                            <p className="text-sm text-blue-800 font-medium">Your update regarding "Metro Expansion" received 1.2k likes.</p>
                        </div>
                        <div className="pl-6 relative">
                            <div className="absolute left-0 top-1.5 w-4 h-4 bg-blue-500 rounded-full border-4 border-blue-100"></div>
                            <p className="text-xs font-bold text-blue-400 mb-1">Yesterday</p>
                            <p className="text-sm text-blue-800 font-medium">New RTI filed: "Road Maintenance Budget 2024".</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RTIRadarTab = ({ requests }: any) => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Incoming RTI Requests</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-2xl">
                These Right to Information applications have been generated by the Nyay Fauj volunteer network targeting your office. 
                Proactively disclosing this information can improve your transparency score.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
                {requests.length > 0 ? requests.map((req: any) => (
                    <div key={req.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold uppercase text-slate-500">{req.status}</span>
                            <span className="text-xs font-mono text-slate-400">{new Date(req.generatedDate).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">{req.topic}</h4>
                        <p className="text-sm text-slate-600 mb-4">{req.description}</p>
                        
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">View Draft</button>
                            <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm">Prepare Response</button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-2 text-center py-12 text-slate-400">No active RTI requests found.</div>
                )}
            </div>
        </div>
    </div>
);

const StatCard = ({ label, value, subValue, icon, bg }: any) => (
    <div className={`p-6 rounded-[24px] border ${bg} flex flex-col justify-between h-32`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">{label}</p>
                <h3 className="text-3xl font-black tracking-tight">{value}</h3>
            </div>
            <div className="p-2 bg-white/50 rounded-xl">{icon}</div>
        </div>
        <p className="text-xs font-bold opacity-70">{subValue}</p>
    </div>
);

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            active ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
        }`}
    >
        {icon} {label}
    </button>
);

export default PoliticianDashboard;
