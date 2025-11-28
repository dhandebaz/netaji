
import React, { useState } from 'react';
import { 
    LayoutDashboard, FileText, CheckCircle, FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import RTI Sub-pages
import RTIDashboard from './rti/RTIDashboard';
import RTITaskRegistry from './rti/RTITaskRegistry';
import RTIVerification from './rti/RTIVerification';
import RTITemplates from './rti/RTITemplates';

const AdminRTI: React.FC = () => {
    const [activePage, setActivePage] = useState<'overview' | 'tasks' | 'verification' | 'templates'>('overview');

    return (
        <div className="w-full max-w-7xl mx-auto relative pb-10">
             
             {/* Header & Nav */}
             <div className="mb-8">
                 <h1 className="text-3xl font-black text-slate-900 mb-2">RTI Operations</h1>
                 <p className="text-slate-500 font-medium mb-6">Manage the entire lifecycle of Right to Information requests.</p>
                 
                 <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex gap-1">
                     <NavButton 
                        active={activePage === 'overview'} 
                        onClick={() => setActivePage('overview')} 
                        icon={<LayoutDashboard size={16} />}
                        label="Mission Control"
                     />
                     <NavButton 
                        active={activePage === 'tasks'} 
                        onClick={() => setActivePage('tasks')} 
                        icon={<FileText size={16} />}
                        label="Task Registry"
                     />
                     <NavButton 
                        active={activePage === 'verification'} 
                        onClick={() => setActivePage('verification')} 
                        icon={<CheckCircle size={16} />}
                        label="Verification Console"
                     />
                     <NavButton 
                        active={activePage === 'templates'} 
                        onClick={() => setActivePage('templates')} 
                        icon={<FileCode size={16} />}
                        label="AI Templates"
                     />
                 </div>
             </div>

             {/* Content Area */}
             <div className="min-h-[500px]">
                 <AnimatePresence mode="wait">
                     <motion.div
                        key={activePage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                     >
                         {activePage === 'overview' && <RTIDashboard onViewTasks={() => setActivePage('tasks')} />}
                         {activePage === 'tasks' && <RTITaskRegistry />}
                         {activePage === 'verification' && <RTIVerification />}
                         {activePage === 'templates' && <RTITemplates />}
                     </motion.div>
                 </AnimatePresence>
             </div>
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
            active 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
        {icon} {label}
    </button>
);

export default AdminRTI;
