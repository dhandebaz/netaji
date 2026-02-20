import React, { useState } from 'react';
import { ArrowRight, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface Props {
    mode: 'login' | 'signup';
    role: UserRole;
    onToggleMode: () => void;
    onBack: () => void;
}

const StandardAuthForm: React.FC<Props> = ({ mode, role, onToggleMode, onBack }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const success = await login(role, email || undefined, password || undefined);
            if (success) {
                if (role === 'superadmin') navigate('/superadmin');
                else if (role === 'developer') navigate('/developer');
                else if (role === 'volunteer') navigate('/volunteer');
                else if (role === 'representative') navigate('/politician-dashboard');
                else navigate('/');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-8">
                <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-6">
                    &larr; Back to Roles
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">Signing in as</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-bold uppercase tracking-wide border border-slate-200">
                            {role}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            placeholder={`${role}@neta.app`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            placeholder="Enter your password"
                        />
                    </div>

                    {mode === 'signup' && role === 'developer' && (
                        <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex gap-3 items-start">
                            <Lock size={16} className="text-purple-600 mt-0.5" />
                            <p className="text-xs text-purple-800 leading-relaxed">
                                You'll be redirected to billing after this step.
                            </p>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                {mode === 'login' ? 'Sign In' : 'Continue'} <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button onClick={onToggleMode} className="text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">
                        {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StandardAuthForm;
