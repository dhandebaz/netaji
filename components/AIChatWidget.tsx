
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, ChevronDown, Loader, User, Bot, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { runNetaAIChat, ChatMessage } from '../services/geminiService';
import { LiveVoiceMode } from './LiveVoiceMode';

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Namaste! I'm your Neta Assistant. Ask me about any politician's assets, criminal record, or track record." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isLiveMode) scrollToBottom();
  }, [messages, isOpen, isLiveMode]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await runNetaAIChat(messages, input);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered a connection error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] md:w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col absolute bottom-full right-0 origin-bottom-right"
            style={{ maxHeight: '600px', height: 'calc(100vh - 120px)' }}
          >
            {isLiveMode ? (
              <LiveVoiceMode onClose={() => setIsLiveMode(false)} />
            ) : (
              <>
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles size={18} />
                    </div>
                    <div>
                       <h3 className="font-bold text-sm">Neta Assistant</h3>
                       <p className="text-[10px] text-blue-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                       </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setIsLiveMode(true)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
                      title="Start Voice Chat"
                    >
                      <Headphones size={20} />
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100 text-blue-600'}`}>
                          {msg.role === 'user' ? <User size={16} className="text-slate-500"/> : <Bot size={18} />}
                       </div>
                       <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                         msg.role === 'user' 
                         ? 'bg-slate-900 text-white rounded-tr-none' 
                         : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'
                       }`}>
                          {msg.text}
                       </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex gap-3">
                       <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Bot size={18} />
                       </div>
                       <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                   <form 
                     onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                     className="flex gap-2 items-center bg-slate-100 p-1.5 pr-2 rounded-full border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
                   >
                      <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about politicians..."
                        className="flex-grow bg-transparent px-4 py-2 outline-none text-sm text-slate-700 placeholder-slate-400 min-w-0"
                      />
                      <button 
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                      >
                        {loading ? <Loader className="animate-spin" size={16} /> : <Send size={16} className="ml-0.5" />}
                      </button>
                   </form>
                   <div className="text-[10px] text-center text-slate-400 mt-2 font-medium">
                      Automated responses can be inaccurate. Verify independently.
                   </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors relative ${isOpen ? 'bg-slate-700 rotate-90' : 'bg-gradient-to-br from-blue-600 to-indigo-600'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" className="opacity-90" />}
        
        {/* Notification Dot */}
        {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="w-full h-full rounded-full bg-red-500 animate-ping absolute opacity-75"></span>
            </span>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatWidget;
