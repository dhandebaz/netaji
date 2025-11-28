
import React, { useState, useRef } from 'react';
import { Upload, ScanFace, CheckCircle, AlertCircle, Smartphone, ArrowRight, Loader, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { extractVoterIdFromImage } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';

interface Props {
    onBack: () => void;
}

const VoterSignupForm: React.FC<Props> = ({ onBack }) => {
    const { login } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Processing/Verify, 3: Credentials
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [epicNumber, setEpicNumber] = useState('');
    const [error, setError] = useState('');
    
    // Credential State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        // Basic Validation
        if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
            setError("File is too large. Max 5MB.");
            return;
        }

        setFile(selectedFile);
        setError('');
        processImage(selectedFile);
    };

    const processImage = async (imageFile: File) => {
        setStep(2);
        setIsProcessing(true);
        
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                const extractedId = await extractVoterIdFromImage(base64, imageFile.type);
                
                if (extractedId && extractedId.length > 5) {
                    setEpicNumber(extractedId);
                    setIsProcessing(false);
                } else {
                    setError("Could not detect a valid Voter ID (EPIC) number. Please ensure the image is clear.");
                    setIsProcessing(false);
                    setStep(1); // Go back
                }
            };
            reader.readAsDataURL(imageFile);
        } catch (err) {
            setError("Error processing image.");
            setIsProcessing(false);
            setStep(1);
        }
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would send the EPIC hash + credentials to the backend
        login('voter');
    };

    return (
        <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden relative">
            <div className="p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mb-4">
                        <Shield size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">Voter Registration</h2>
                    <p className="text-slate-500 text-sm mt-1">Government ID verification required.</p>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileSelect}
                            />
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={28} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-1">Upload Voter ID Card</h3>
                            <p className="text-xs text-slate-500">JPG or PNG (Max 5MB)</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <div className="text-center">
                            <button onClick={onBack} className="text-slate-400 text-xs font-bold hover:text-slate-600">Cancel</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="text-center py-8 space-y-6 animate-in fade-in">
                        {isProcessing ? (
                            <>
                                <div className="relative w-24 h-24 mx-auto">
                                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                                    <ScanFace className="absolute inset-0 m-auto text-slate-400" size={32} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Verifying Document...</h3>
                                    <p className="text-slate-500 text-sm">Extracting EPIC Number via AI</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={40} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Identity Verified</h3>
                                    <p className="text-slate-500 text-sm">EPIC No: <span className="font-mono font-bold text-slate-800">{epicNumber}</span></p>
                                </div>
                                <button 
                                    onClick={() => setStep(3)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-8">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-800 uppercase">ID Linked</p>
                                <p className="text-xs text-blue-600 font-mono">{epicNumber}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="name@example.com"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1">Create Password</label>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="••••••••"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all mt-2"
                        >
                            Create Voter Account
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default VoterSignupForm;
