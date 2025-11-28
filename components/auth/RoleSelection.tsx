
import React from 'react';
import { User, ShieldCheck, Mic2, Terminal, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '../../types';

interface Props {
    onSelect: (role: UserRole) => void;
    pricing?: any;
}

const RoleSelection: React.FC<Props> = ({ onSelect, pricing }) => {
    return (
        <div className="space-y-10">
            <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Choose your Identity</h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">Join Neta to participate in democracy, volunteer for transparency, or build on our data.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                <RoleCard 
                    title="Citizen Voter" 
                    icon={<User size={32}/>}
                    desc="Verify your identity, cast votes, and track your MP/MLA."
                    features={["Anonymous Voting", "Constituency Updates"]}
                    color="blue"
                    onClick={() => onSelect('voter')}
                />

                <RoleCard 
                    title="Nyay Fauj" 
                    icon={<ShieldCheck size={32}/>}
                    desc="Join the task force. File RTIs and verify data."
                    features={["Smart RTI Filing", "Impact Score"]}
                    color="orange"
                    onClick={() => onSelect('volunteer')}
                />

                <RoleCard 
                    title="Representative" 
                    icon={<Mic2 size={32}/>}
                    desc="For elected officials to manage their profile and updates."
                    features={["Official Broadcasts", "Voter Sentiment"]}
                    color="green"
                    onClick={() => onSelect('representative')}
                />

                <RoleCard 
                    title="Developer" 
                    icon={<Terminal size={32}/>}
                    desc="Access raw data via API for research or apps."
                    features={["API Access", "Webhooks"]}
                    color="purple"
                    priceTag={pricing ? `${pricing.currency}${pricing.monthly}/mo` : undefined}
                    onClick={() => onSelect('developer')}
                />
            </div>
            
            <div className="text-center pt-4">
                <button onClick={() => onSelect('voter')} className="text-sm font-bold text-slate-400 hover:text-slate-600">
                    Already have an account? Sign In
                </button>
            </div>
        </div>
    );
};

const RoleCard = ({ title, icon, desc, features, color, onClick, priceTag }: any) => {
    const colors: Record<string, string> = {
        blue: 'hover:border-blue-500 hover:shadow-blue-500/20',
        orange: 'hover:border-orange-500 hover:shadow-orange-500/20',
        purple: 'hover:border-purple-500 hover:shadow-purple-500/20',
        green: 'hover:border-green-500 hover:shadow-green-500/20'
    };
    const iconColors: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600'
    };

    return (
        <motion.button 
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 text-left transition-all duration-300 flex flex-col h-full group ${colors[color]}`}
        >
            <div className="flex justify-between items-start mb-6 w-full">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${iconColors[color]}`}>
                    {icon}
                </div>
                {priceTag && (
                    <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full shadow-md">
                        {priceTag}
                    </span>
                )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                {desc}
            </p>

            <ul className="space-y-3 border-t border-slate-100 pt-6 w-full">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                        <Check size={14} className="text-green-500" /> {f}
                    </li>
                ))}
            </ul>
            
            <div className="w-full mt-8 py-3 rounded-xl bg-slate-50 text-slate-900 text-sm font-bold text-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                Select
            </div>
        </motion.button>
    )
}

export default RoleSelection;
