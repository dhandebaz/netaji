'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Upload, Building2, Mail, Phone, CheckCircle, FileText, Download, AlertCircle } from 'lucide-react';
import { Politician } from '../types';
import { jsPDF } from "jspdf";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  politician: Politician;
}

const ClaimProfileModal: React.FC<Props> = ({ isOpen, onClose, politician }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    officialEmail: '',
    phone: '',
    designation: '',
  });
  const [emailError, setEmailError] = useState('');
  const [fileAttached, setFileAttached] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
      const allowedDomains = ['gov.in', 'nic.in', 'sansad.nic.in', 'vidhansabha.nic.in'];
      const domain = email.split('@')[1];
      if (!domain) return false;
      return allowedDomains.some(d => domain.endsWith(d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(formData.officialEmail)) {
        setEmailError("Please use an official government email (e.g., .gov.in, .nic.in)");
        return;
    }
    if (!fileAttached) {
        alert("Please upload the signed consent letter.");
        return;
    }
    // Success flow
    setStep(2);
  };

  const handleDownloadTemplate = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LETTER OF CONSENT & APPRECIATION", 20, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`To,\nThe Administrator,\nNeta App Foundation`, 20, 40);
      
      doc.text(`Subject: Verification of Profile for ${politician.name}`, 20, 60);
      
      const body = `I, ${politician.name}, currently serving as ${formData.designation || '[Designation]'}, hereby authorize Neta App to verify my official profile on their platform.\n\nI confirm that I have no objection to participating in democratic activities facilitated by the platform, including sharing official updates and responding to citizen queries.\n\nI appreciate the Neta App team for their efforts in making democracy and politician data more accessible to the public. This initiative promotes transparency and accountability, which are the pillars of our nation.\n\nAttached herewith is my official ID proof for verification purposes.`;
      
      const splitText = doc.splitTextToSize(body, 170);
      doc.text(splitText, 20, 80);
      
      doc.text(`\n\n__________________________\n(Signature & Official Seal)\n\nDate: ${new Date().toLocaleDateString()}`, 20, 150);
      
      doc.save(`Neta_Consent_Letter_${politician.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" />
              Claim Profile
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 overflow-y-auto custom-scrollbar">
            {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-900">
                            You are claiming the profile of <span className="font-bold">{politician.name}</span>. 
                            Verification requires an official government email and a signed consent letter.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Official Gov Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    required
                                    placeholder="name@sansad.nic.in"
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border outline-none focus:ring-2 text-slate-900 font-medium ${emailError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-500'}`}
                                    value={formData.officialEmail}
                                    onChange={e => { setFormData({...formData, officialEmail: e.target.value}); setEmailError(''); }}
                                />
                            </div>
                            {emailError && <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10}/> {emailError}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Current Designation</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Member of Parliament"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                                    value={formData.designation}
                                    onChange={e => setFormData({...formData, designation: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Official Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input 
                                    type="tel" 
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                           <div className="flex justify-between items-end mb-2">
                               <label className="block text-xs font-bold text-slate-500 uppercase ml-1">Consent Letter</label>
                               <button type="button" onClick={handleDownloadTemplate} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                                   <Download size={12}/> Download Template
                               </button>
                           </div>
                           <div 
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${fileAttached ? 'bg-green-50 border-green-200' : 'border-slate-300 hover:bg-slate-50'}`}
                                onClick={() => setFileAttached(!fileAttached)} // Mock upload toggle
                           >
                              {fileAttached ? (
                                  <div className="flex flex-col items-center text-green-700">
                                      <CheckCircle size={32} className="mb-2" />
                                      <p className="text-sm font-bold">Document Uploaded</p>
                                      <p className="text-xs mt-1">Click to remove</p>
                                  </div>
                              ) : (
                                  <>
                                    <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                                    <p className="text-sm text-slate-600 font-medium">Upload Signed PDF / JPG</p>
                                    <p className="text-xs text-slate-400 mt-1">Must be on official letterhead</p>
                                  </>
                              )}
                           </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 hover:shadow-lg transition-all active:scale-95">
                            Submit for Verification
                        </button>
                    </div>
                </form>
            ) : (
                <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">Request Submitted</h4>
                    <p className="text-slate-500 mb-8 max-w-xs mx-auto font-medium">
                        Our team will verify your documents within 24 hours. You will receive a confirmation email at <span className="text-slate-900 font-bold">{formData.officialEmail}</span>.
                    </p>
                    <button onClick={onClose} className="bg-slate-100 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                        Close
                    </button>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClaimProfileModal;
