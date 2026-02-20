
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Send, CheckCircle, MapPin, Phone } from 'lucide-react';
import { submitSupportTicket } from '../services/apiService';
import { Helmet } from 'react-helmet-async';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitSupportTicket(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('idle');
      alert('Failed to send your message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 md:px-8 font-sans">
      <Helmet>
        <title>Contact Us | Neta</title>
        <meta
          name="description"
          content="Get support for data accuracy, payments, or platform usage. Reach the Neta team directly."
        />
        <link rel="canonical" href="https://neta.ink/contact" />
        <meta property="og:title" content="Contact Us | Neta" />
        <meta
          property="og:description"
          content="Contact the Neta team for questions about political data, API access, or support."
        />
        <meta property="og:url" content="https://neta.ink/contact" />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-6"
             >
                <Mail size={32} />
             </motion.div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Get in Touch</h1>
             <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                Have a question about data accuracy, payments, or platform usage? We're here to help.
             </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
                <div className="bg-slate-900 text-white p-8 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><MessageSquare size={120}/></div>
                    <h3 className="text-2xl font-bold mb-6 relative z-10">Contact Info</h3>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl"><Mail size={20}/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">General Inquiries</p>
                                <p className="font-medium">hello@neta.ink</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl"><Phone size={20}/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Support Line</p>
                                <p className="font-medium">+91 8000-NETA-AI</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white/10 rounded-xl"><MapPin size={20}/></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">HQ</p>
                                <p className="font-medium leading-relaxed">
                                    Neta Foundation,<br/>
                                    Tech Park, Sector 5,<br/>
                                    Gurugram, India
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-2">For Developers</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        Issues with API Keys or Webhooks? Check our status page or priority support.
                    </p>
                    <a href="#" className="text-blue-600 font-bold text-sm hover:underline">Visit Developer Docs &rarr;</a>
                </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl border border-slate-200"
                >
                    {status === 'success' ? (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                            <p className="text-slate-500 mb-8">
                                We've received your grievance. A ticket has been created in our Admin system.<br/>
                                Reference ID: #{Date.now().toString().slice(-6)}
                            </p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        placeholder="Amit Kumar"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Subject</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    required
                                >
                                    <option value="">Select a topic...</option>
                                    <option value="Data Inaccuracy">Report Data Inaccuracy</option>
                                    <option value="Payment Issue">Payment / Billing Issue</option>
                                    <option value="API Access">API / Developer Access</option>
                                    <option value="Feedback">General Feedback</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Message</label>
                                <textarea 
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[150px] resize-none"
                                    placeholder="Describe your issue in detail..."
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {status === 'submitting' ? 'Sending...' : 'Submit Request'} <Send size={20} />
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
