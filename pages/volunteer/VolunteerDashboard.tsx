
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AvailableMissions from './views/AvailableMissions';
import MyOperations from './views/MyOperations';
import Leaderboard from './views/Leaderboard';

interface Props {
    onLogout: () => void;
}

const VolunteerDashboard: React.FC<Props> = ({ onLogout }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'available' | 'my-tasks' | 'leaderboard'>('available');

    return (
        <section className="max-w-6xl mx-auto px-4 pt-32 pb-24">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-8"
            >
                <div>
                   <h2 className="text-3xl font-black text-slate-900">Welcome, Commander</h2>
                   <p className="text-slate-500 flex items-center gap-2">
                      <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor"/> Level 4</span>
                      {user?.name || "Volunteer"}
                   </p>
                </div>
                <div className="flex gap-2">
                     <button onClick={() => window.location.reload()} className="bg-white p-3 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-600"><Zap size={20}/></button>
                     <button onClick={onLogout} className="bg-white text-slate-600 p-3 rounded-full shadow-sm border border-slate-200 hover:bg-slate-50 hover:text-red-600 transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden min-h-[600px]"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-blue-500" size={20} /> Mission Control
                 </h3>
                 <div className="flex space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                    <TabButton label="Available Missions" active={activeTab === 'available'} onClick={() => setActiveTab('available')} />
                    <TabButton label="My Operations" active={activeTab === 'my-tasks'} onClick={() => setActiveTab('my-tasks')} />
                    <TabButton label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
                 </div>
              </div>

              <div className="p-6">
                 {activeTab === 'available' && <AvailableMissions />}
                 {activeTab === 'my-tasks' && <MyOperations />}
                 {activeTab === 'leaderboard' && <Leaderboard />}
              </div>
            </motion.div>
        </section>
    );
};

const TabButton = ({ label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
    >
        {label}
    </button>
);

export default VolunteerDashboard;
