import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, ScanFace, CheckCircle, Smartphone, Upload, AlertCircle, Loader } from 'lucide-react';
import { Politician } from '../types';
import { extractVoterIdFromImage, isAIAvailable } from '../services/geminiService';
import { recordVote, hasUserVoted } from '../services/dataService';
import { recordVoteOnChain } from '../services/blockchainService';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '../services/firebaseClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  politician: Politician;
  voteType: 'up' | 'down';
}

const VoteModal: React.FC<Props> = ({ isOpen, onClose, politician, voteType }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Form, 2: OCR, 3: OTP, 4: Success
  const [voterId, setVoterId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit size to 4MB
    if (file.size > 4 * 1024 * 1024) {
      alert("File too large. Please upload an image under 4MB.");
      return;
    }

    setStep(2);
    setOcrError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Call Gemini Service
        const extractedId = await extractVoterIdFromImage(base64String, file.type);
        
        if (extractedId) {
          setVoterId(extractedId);
          // Short delay to show the "Success" state of scanning
          setTimeout(() => setStep(1), 1500);
        } else {
          setOcrError("Could not detect Voter ID. Please enter manually.");
          setTimeout(() => setStep(1), 2000);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setOcrError("Error processing image.");
      setStep(1);
    }
  };

  const handleVerify = async () => {
    if (voterId.length < 5 || phone.length < 10) {
      alert("Please enter valid details");
      return;
    }
    if (!firebaseAuth) {
      alert("OTP service is not configured. Please contact support.");
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSendingOtp(true);
    setOtpError(null);
    try {
      let verifier: RecaptchaVerifier;
      if (!(window as any).voteOtpRecaptchaVerifier) {
        verifier = new RecaptchaVerifier(
          'vote-otp-recaptcha',
          { size: 'invisible' },
          firebaseAuth
        );
        (window as any).voteOtpRecaptchaVerifier = verifier;
      } else {
        verifier = (window as any).voteOtpRecaptchaVerifier;
      }
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        `+91${digits}`,
        verifier
      );
      setConfirmation(result);
      setStep(3);
    } catch (err) {
      console.error('[Vote OTP] Failed to send OTP', err);
      setOtpError('Could not send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!confirmation) {
      setOtpError('Please request an OTP first.');
      return;
    }
    if (otp.length < 6) {
      setOtpError('Please enter the 6-digit OTP sent to your phone.');
      return;
    }
    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      await confirmation.confirm(otp);
      const existingVote = hasUserVoted(politician.id);
      if (existingVote) {
        alert(`You have already voted ${existingVote === 'up' ? 'for' : 'against'} this politician. Each voter can only vote once per politician.`);
        return;
      }
      const result = recordVote(politician.id, voteType);
      if (result.success) {
        try {
          recordVoteOnChain(politician.constituency, voteType === 'up' ? 'upvote' : 'downvote');
        } catch (e) {
          console.debug('On-chain recording failed (optional):', e);
        }
        setStep(4);
      } else {
        alert("Failed to record your vote. Please try again.");
      }
    } catch (err) {
      console.error('[Vote OTP] Verification failed', err);
      setOtpError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg">Verify & Vote</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {step === 1 && (
              <div className="space-y-5">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                  <Shield className="text-yellow-600 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-bold text-yellow-800">Privacy Protected</p>
                    <p className="text-xs text-yellow-700 mt-1">Your Voter ID is verified instantly but NEVER stored. Your vote is recorded anonymously using SHA-256 hashing.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Constituency</label>
                  <input 
                    type="text" 
                    value={politician.constituency} 
                    disabled 
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" 
                  />
                </div>

                <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Upload Voter ID (Front)</label>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                   />
                   <div 
                      onClick={triggerFileUpload}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${ocrError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-gray-50'}`}
                   >
                      {ocrError ? (
                          <>
                            <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                            <p className="text-sm text-red-600 font-bold">{ocrError}</p>
                            <p className="text-xs text-red-500 mt-1">Click to try again</p>
                          </>
                      ) : (
                          <>
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-500">Click to scan via <span className="font-bold text-blue-600">Gemini Vision</span></p>
                          </>
                      )}
                   </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Voter ID Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ABC1234567" 
                    value={voterId}
                    onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-medium">+91</span>
                    <input 
                      type="tel" 
                      placeholder="98765 43210" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleVerify}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg mt-4"
                >
                  Verify Identity
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="py-10 text-center space-y-6">
                <div className="relative w-24 h-24 mx-auto bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                   <div className="absolute inset-0 flex items-center justify-center">
                     <ScanFace size={48} className="text-gray-400" />
                   </div>
                   <div className="absolute inset-0 bg-blue-500/20 h-1 animate-scan w-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">Analyzing ID...</h4>
                  <p className="text-sm text-gray-500 mt-1">Powered by Gemini 2.5 Vision</p>
                </div>
                <div className="flex justify-center">
                    <Loader className="animate-spin text-blue-600" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 py-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="text-blue-600" size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">Enter OTP</h4>
                  <p className="text-sm text-gray-500 mt-1">We sent a code to +91 {phone}</p>
                  {otpError && (
                    <p className="text-xs text-red-500 mt-1">{otpError}</p>
                  )}
                </div>

                <input 
                  type="text" 
                  maxLength={6}
                  className="w-full text-center text-3xl tracking-[1em] font-bold py-4 border-b-2 border-gray-300 focus:border-blue-600 outline-none"
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button 
                  onClick={handleOtpSubmit}
                  disabled={isVerifyingOtp}
                  className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg mt-4 disabled:opacity-50 disabled:cursor-not-allowed ${voteType === 'up' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                >
                  {isVerifyingOtp ? 'Verifying...' : `Confirm Vote ${voteType === 'up' ? '👍' : '👎'}`}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="py-10 text-center space-y-6">
                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle className="text-green-600" size={48} />
                 </div>
                 <div>
                   <h4 className="text-2xl font-bold text-gray-900">Vote Recorded!</h4>
                   <p className="text-gray-600 mt-2 max-w-xs mx-auto">
                     Thank you for participating in democracy. Your vote has been anonymously added to the public ledger.
                   </p>
                 </div>
                 <button 
                   onClick={onClose}
                   className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                 >
                   Close
                 </button>
              </div>
            )}
          </div>
          <div id="vote-otp-recaptcha" className="hidden" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VoteModal;
