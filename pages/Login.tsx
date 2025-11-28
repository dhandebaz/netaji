
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDeveloperPricing } from '../services/adminService';

// Import Modular Auth Components
import RoleSelection from '../components/auth/RoleSelection';
import StandardAuthForm from '../components/auth/StandardAuthForm';
import VoterSignupForm from '../components/auth/VoterSignupForm';

const Login: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  // State Management
  const [step, setStep] = useState<'role-selection' | 'auth-form'>('role-selection');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login'); // Default to login
  const [selectedRole, setSelectedRole] = useState<UserRole>('voter');
  const [pricing, setPricing] = useState(getDeveloperPricing());

  useEffect(() => {
    // If ?tab=signup is present, default to signup mode
    if (searchParams.get('tab') === 'signup') {
        setAuthMode('signup');
    }
    
    // Redirect if already logged in
    if (user) {
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'developer') navigate('/developer');
      else if (user.role === 'volunteer') navigate('/volunteer');
      else if (user.role === 'representative') navigate('/politician-dashboard');
      else navigate('/');
    }
    setPricing(getDeveloperPricing());
  }, [user, navigate, searchParams]);

  // Handle role selection from the main grid
  const handleRoleSelect = (role: UserRole) => {
      setSelectedRole(role);
      setStep('auth-form');
      // If coming from the "Join" buttons, default to signup. 
      // Otherwise, default to login but allow toggle.
      if (searchParams.get('tab') === 'signup') setAuthMode('signup');
  };

  // Quick Bypass for demo (Super Admin)
  const handleDebugLogin = () => {
    login('superadmin');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px]" />
         <div className="absolute -bottom-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <AnimatePresence mode="wait">
            {step === 'role-selection' ? (
                <motion.div 
                    key="roles"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    <RoleSelection onSelect={handleRoleSelect} pricing={pricing} />
                </motion.div>
            ) : (
                <motion.div 
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {/* 
                        Logic: 
                        If Role is VOTER and Mode is SIGNUP -> Show VoterSignupForm (ID verification).
                        Otherwise -> Show StandardAuthForm (Email/Pass).
                    */}
                    {selectedRole === 'voter' && authMode === 'signup' ? (
                        <VoterSignupForm onBack={() => setStep('role-selection')} />
                    ) : (
                        <StandardAuthForm 
                            mode={authMode}
                            role={selectedRole}
                            onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            onBack={() => setStep('role-selection')}
                        />
                    )}

                     {/* Debug Backdoor */}
                     <div className="max-w-md mx-auto mt-8 bg-white/50 backdrop-blur p-4 rounded-xl border border-slate-100 text-center">
                        <button 
                            onClick={handleDebugLogin}
                            className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center justify-center gap-2 w-full py-1 transition-colors"
                        >
                            <AlertTriangle size={12} /> Debug: Enter as SuperAdmin
                        </button>
                     </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;
