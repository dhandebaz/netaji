
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import VolunteerLanding from './volunteer/VolunteerLanding';
import VolunteerDashboard from './volunteer/VolunteerDashboard';

const NyayFauj: React.FC = () => {
  const { user } = useAuth();
  const [viewState, setViewState] = useState<'landing' | 'dashboard'>('landing');

  useEffect(() => {
      if (user && (user.role === 'volunteer' || user.role === 'superadmin')) {
          setViewState('dashboard');
      }
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
        <AnimatePresence mode="wait">
            {viewState === 'landing' ? (
                <motion.div 
                    key="landing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                >
                    <VolunteerLanding onJoin={() => setViewState('dashboard')} />
                </motion.div>
            ) : (
                <motion.div 
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <VolunteerDashboard onLogout={() => setViewState('landing')} />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default NyayFauj;
