import React, { useState, useEffect } from 'react';
import { Smartphone, Loader2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { firebaseAuth } from '../../services/firebaseClient';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface Props {
  role: UserRole;
  onBack: () => void;
}

const PhoneOtpLoginForm: React.FC<Props> = ({ role, onBack }) => {
  const { loginWithFirebase } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      const container = document.getElementById('otp-recaptcha-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  const startOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firebaseAuth) {
      setError('OTP login is not configured. Please try email login or contact support.');
      return;
    }
    const trimmed = phone.replace(/\D/g, '');
    if (trimmed.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    try {
      let verifier: RecaptchaVerifier;
      if (!(window as any).otpRecaptchaVerifier) {
        verifier = new RecaptchaVerifier(
          'otp-recaptcha-container',
          { size: 'invisible' },
          firebaseAuth
        );
        (window as any).otpRecaptchaVerifier = verifier;
      } else {
        verifier = (window as any).otpRecaptchaVerifier;
      }
      const result = await signInWithPhoneNumber(
        firebaseAuth,
        `+91${trimmed}`,
        verifier
      );
      setConfirmation(result);
      setStep('code');
    } catch (err) {
      console.error('[OTP] Failed to start phone auth', err);
      setError('Could not send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!confirmation) {
      setError('Please request an OTP first');
      return;
    }
    if (otp.trim().length < 6) {
      setError('Enter the 6-digit OTP you received');
      return;
    }
    setIsLoading(true);
    try {
      const cred = await confirmation.confirm(otp.trim());
      const idToken = await cred.user.getIdToken();
      const ok = await loginWithFirebase(role, idToken);
      if (ok) {
        if (role === 'superadmin') navigate('/superadmin');
        else if (role === 'developer') navigate('/developer');
        else if (role === 'volunteer') navigate('/volunteer');
        else if (role === 'representative') navigate('/politician-dashboard');
        else navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('[OTP] Verification failed', err);
      setError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden">
      <div className="p-8">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 mb-6"
        >
          &larr; Back to Roles
        </button>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Secure OTP Login</h2>
          <p className="text-slate-500 text-sm">
            Sign in with your verified mobile number.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={startOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-1.5">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <span className="px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  placeholder="98765 43210"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP <Smartphone size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase ml-1 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                className="w-full text-center text-3xl tracking-[0.6em] font-bold py-4 border-b-2 border-slate-300 focus:border-blue-600 outline-none"
                placeholder="••••••"
              />
              <p className="text-xs text-slate-400 text-center mt-2">
                Sent to +91 {phone.replace(/\D/g, '')}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                'Confirm & Continue'
              )}
            </button>
          </form>
        )}

        <div id="otp-recaptcha-container" className="mt-4" />
      </div>
    </div>
  );
};

export default PhoneOtpLoginForm;

