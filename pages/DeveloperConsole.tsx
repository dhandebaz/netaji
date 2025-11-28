
import React, { useState, useEffect } from 'react';
import { Terminal, Key, CreditCard, BarChart3, Copy, Check, Shield, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getDeveloperPricing } from '../services/adminService';

const DeveloperConsole: React.FC = () => {
  const { user } = useAuth();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pricing, setPricing] = useState(getDeveloperPricing());

  useEffect(() => {
      setPricing(getDeveloperPricing());
  }, []);

  const handleCopy = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // If user is not a developer, show the sales page
  if (!user || (user.role !== 'developer' && user.role !== 'superadmin')) {
    return <DeveloperPricingView pricing={pricing} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 md:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
           <div>
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                 <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Terminal size={32}/></div>
                 Developer Console
              </h1>
              <p className="text-slate-500 font-medium mt-2 ml-1">Manage your API keys, usage, and billing.</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-full border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
              Plan: <span className="text-purple-600">Pro Enterprise</span>
           </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           
           {/* LEFT: API Keys */}
           <div className="lg:col-span-2 space-y-8">
               <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <Key className="text-blue-500" /> API Credentials
                  </h2>
                  
                  <div className="bg-slate-900 rounded-2xl p-6 relative group overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><Terminal size={120} color="white"/></div>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Live Secret Key</p>
                     <div className="flex items-center gap-4">
                        <code className="font-mono text-lg text-white flex-grow truncate">
                           {showKey ? user.apiKey || 'nk_live_SAMPLE_KEY_8923' : 'nk_live_••••••••••••••••••••'}
                        </code>
                        <button 
                           onClick={() => setShowKey(!showKey)} 
                           className="text-slate-400 hover:text-white transition-colors text-xs font-bold"
                        >
                           {showKey ? 'Hide' : 'Reveal'}
                        </button>
                        <button 
                           onClick={handleCopy}
                           className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors"
                        >
                           {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18}/>}
                        </button>
                     </div>
                     <div className="mt-4 flex gap-2">
                        <div className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase border border-green-500/30">Active</div>
                        <div className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded uppercase border border-blue-500/30">Read/Write</div>
                     </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                     <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors">
                        Roll Key
                     </button>
                  </div>
               </div>

               <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <BarChart3 className="text-orange-500" /> Usage Analytics
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                     <StatBox label="Requests (This Month)" value="1.2M" max="5M" color="bg-blue-500" />
                     <StatBox label="Error Rate" value="0.02%" max="1%" color="bg-green-500" />
                     <StatBox label="Latency (Avg)" value="140ms" max="200ms" color="bg-purple-500" />
                  </div>
                  
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[24%]"></div>
                  </div>
                  <p className="text-right text-xs font-bold text-slate-400 mt-2">24% of monthly quota used</p>
               </div>
           </div>

           {/* RIGHT: Billing & Support */}
           <div className="space-y-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                 <div className="relative z-10">
                    <CreditCard className="mb-4 text-white/80" size={32} />
                    <h3 className="text-lg font-bold mb-1">Enterprise Plan</h3>
                    <p className="text-slate-400 text-sm mb-6">Next billing date: Nov 24, 2025</p>
                    <div className="text-3xl font-black mb-6">{pricing.currency}{pricing.yearly.toLocaleString()}<span className="text-sm font-medium text-slate-400">/yr</span></div>
                    
                    <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
                       Manage Billing
                    </button>
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-900 mb-4">Developer Resources</h3>
                 <ul className="space-y-3">
                    <ResourceLink label="API Documentation" />
                    <ResourceLink label="SDKs & Libraries" />
                    <ResourceLink label="Join Slack Community" />
                    <ResourceLink label="Status Page" />
                 </ul>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

const DeveloperPricingView = ({ pricing }: { pricing: any }) => (
  <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
         <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
             <Terminal size={16} /> Developer API
         </div>
         <h1 className="text-5xl font-black text-slate-900 mb-6">Build with Political Intelligence</h1>
         <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Access raw data, real-time sentiment analysis, and deep-dive analytics for your organization.
         </p>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200 flex flex-col">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Tier</h3>
              <p className="text-slate-500 mb-8">For students and hobbyists.</p>
              <div className="text-4xl font-black text-slate-900 mb-8">₹0</div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                 <Feature text="1,000 Requests / mo" />
                 <Feature text="Public Datasets Only" />
                 <Feature text="Community Support" />
              </ul>

              <button className="w-full py-4 rounded-2xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 transition-colors">
                  Get Started
              </button>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-10 shadow-2xl text-white flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                  RECOMMENDED
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-8">For newsrooms and NGOs.</p>
              <div className="text-4xl font-black text-white mb-8">{pricing.currency}{pricing.yearly.toLocaleString()}<span className="text-lg text-slate-500 font-medium">/yr</span></div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                 <Feature text="5 Million Requests / mo" dark />
                 <Feature text="Real-time Sentiment API" dark />
                 <Feature text="Deep Criminal History" dark />
                 <Feature text="Dedicated Support" dark />
              </ul>

              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-blue-900/50 transition-all">
                  Contact Sales
              </button>
          </div>
      </div>
  </div>
);

const Feature = ({ text, dark }: { text: string, dark?: boolean }) => (
    <li className="flex items-center gap-3 font-medium">
        <div className={`p-1 rounded-full ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'}`}>
            <Check size={14} />
        </div>
        <span className={dark ? 'text-slate-200' : 'text-slate-600'}>{text}</span>
    </li>
);

const StatBox = ({ label, value, max, color }: any) => (
   <div className="p-4 bg-slate-50 rounded-xl">
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</div>
      <div className="text-xl font-black text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-400">of {max}</div>
   </div>
);

const ResourceLink = ({ label }: any) => (
   <a href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-600 font-medium text-sm group transition-colors">
       {label}
       <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600" />
   </a>
);

export default DeveloperConsole;
