
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Vote, ShieldCheck } from 'lucide-react';
import { getAllPoliticians, addPolitician, deletePolitician, getClaims, updateClaimStatus, updatePolitician } from '../../services/dataService';
import { ClaimRequest, Politician } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

import PoliticianStats from './politicians/PoliticianStats';
import PoliticianTable from './politicians/PoliticianTable';
import VerificationQueue from './politicians/VerificationQueue';
import AddPoliticianModal from './politicians/AddPoliticianModal';

const AdminPoliticians: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'elected' | 'candidates' | 'claims'>('dashboard');
    const [claims, setClaims] = useState<ClaimRequest[]>([]);
    const [politicians, setPoliticians] = useState<Politician[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { addToast } = useToast();

    const refreshData = () => {
        setPoliticians(getAllPoliticians());
        setClaims(getClaims());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const totalPoliticians = politicians.length;
    const verifiedProfiles = politicians.filter(p => p.verified).length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;
    const coverageStates = new Set(politicians.map(p => p.state)).size;

    const handleClaimAction = (id: string, action: 'approve' | 'reject') => {
        updateClaimStatus(id, action === 'approve' ? 'approved' : 'rejected');
        
        if (action === 'approve') {
            const claim = claims.find(c => c.id === id);
            if (claim) {
                updatePolitician(claim.politicianId, { verified: true });
                addToast(`Claim approved for ${claim.politicianName}`, 'success');
            }
        } else {
            addToast('Claim verification rejected', 'warning');
        }
        refreshData();
    };

    const handleAddPolitician = (newPolitician: Partial<Politician>) => {
        const added = addPolitician(newPolitician);
        addToast(`${added.name} added to registry`, 'success');
        refreshData();
    };

    const handleDeletePolitician = (id: number) => {
        if (confirm('Are you sure you want to delete this profile?')) {
            deletePolitician(id);
            addToast('Profile removed', 'info');
            refreshData();
        }
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-[1600px] mx-auto w-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Politician Registry</h1>
                    <p className="text-slate-500 font-medium">Verify representatives, manage candidates, and sync data.</p>
                </div>
                
                {/* Navigation Pills */}
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
                    <NavButton 
                        active={activeTab === 'dashboard'} 
                        onClick={() => setActiveTab('dashboard')} 
                        icon={<LayoutDashboard size={16} />} 
                        label="Overview" 
                    />
                    <NavButton 
                        active={activeTab === 'elected'} 
                        onClick={() => setActiveTab('elected')} 
                        icon={<Users size={16} />} 
                        label="Elected Officials" 
                    />
                    <NavButton 
                        active={activeTab === 'candidates'} 
                        onClick={() => setActiveTab('candidates')} 
                        icon={<Vote size={16} />} 
                        label="Candidates" 
                    />
                    <NavButton 
                        active={activeTab === 'claims'} 
                        onClick={() => setActiveTab('claims')} 
                        icon={<ShieldCheck size={16} />} 
                        label={`Verifications`}
                        badge={pendingClaims > 0 ? pendingClaims : undefined}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div 
                            key="dashboard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="h-full overflow-y-auto custom-scrollbar p-1"
                        >
                            <PoliticianStats 
                                stats={{ total: totalPoliticians, verified: verifiedProfiles, pending: pendingClaims, states: coverageStates }} 
                                onNavigate={(tab) => setActiveTab(tab as any)}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'elected' && (
                        <motion.div 
                            key="elected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            <PoliticianTable 
                                type="elected" 
                                data={politicians} 
                                onAdd={() => setIsAddModalOpen(true)} 
                                onDelete={handleDeletePolitician}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'candidates' && (
                        <motion.div 
                            key="candidates"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col"
                        >
                            <PoliticianTable 
                                type="candidate" 
                                data={[]} // Using empty array for demo distinction
                                onAdd={() => setIsAddModalOpen(true)} 
                                onDelete={handleDeletePolitician}
                            />
                        </motion.div>
                    )}

                    {activeTab === 'claims' && (
                        <motion.div 
                            key="claims"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full"
                        >
                            <VerificationQueue claims={claims} onAction={handleClaimAction} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
            <AddPoliticianModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAdd={handleAddPolitician}
            />
        </div>
    );
};

const NavButton = ({ active, onClick, icon, label, badge }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
            active 
            ? 'bg-slate-900 text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
        {icon} {label}
        {badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
);

export default AdminPoliticians;
