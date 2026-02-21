import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Code, AlertTriangle, CheckCircle, Loader2, Terminal, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const AdminAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Development Assistant. I can help you:\n\n• Analyze code and suggest improvements\n• Generate new features\n• Debug issues\n• Optimize performance\n• Review security\n\nWhat would you like to work on today?",
      timestamp: new Date(),
      suggestions: [
        'Analyze the codebase for optimization opportunities',
        'Help me add a new feature',
        'Check for security vulnerabilities'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: 'superadmin',
          history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, I encountered an issue processing your request.',
        timestamp: new Date(),
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, I encountered an issue connecting to the AI service. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const runAnalysis = async (type: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: type })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex gap-6">
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-bold text-white">AI Development Assistant</h2>
              <p className="text-xs text-white/70">Powered by NetaAI - Ready to help upgrade your app</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles className="text-white" size={16} />
                  </div>
                )}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-2xl ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-md' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-[10px] text-slate-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                    <User className="text-slate-500" size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shrink-0">
                <Loader2 className="text-white animate-spin" size={16} />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-bl-md border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me to improve the app, generate code, or analyze issues..."
              className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button 
              onClick={() => runAnalysis('performance')}
              className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Run Health Check</p>
                  <p className="text-xs text-slate-400">Analyze app performance</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => runAnalysis('security')}
              className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Security Scan</p>
                  <p className="text-xs text-slate-400">Check for vulnerabilities</p>
                </div>
              </div>
            </button>
            
            <button 
              onClick={() => runAnalysis('code-quality')}
              className="w-full p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Code Review</p>
                  <p className="text-xs text-slate-400">AI-powered code analysis</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
          >
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Terminal size={16} className="text-purple-500" />
              Analysis Results
            </h3>
            <div className="space-y-2">
              {analysisResult.findings?.map((finding: any, idx: number) => (
                <div key={idx} className={`p-2 rounded-lg text-xs ${
                  finding.severity === 'low' ? 'bg-yellow-50 text-yellow-700' :
                  finding.severity === 'info' ? 'bg-blue-50 text-blue-700' :
                  'bg-green-50 text-green-700'
                }`}>
                  <span className="font-medium">[{finding.category}]</span> {finding.message}
                </div>
              ))}
            </div>
            
            {analysisResult.recommendations?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 mb-2">Recommendations:</p>
                <ul className="space-y-1">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Bot size={16} />
            AI Capabilities
          </h3>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li>• Generate React components</li>
            <li>• Debug code issues</li>
            <li>• Optimize performance</li>
            <li>• Security analysis</li>
            <li>• Database optimization</li>
            <li>• API improvements</li>
          </ul>
          <p className="text-[10px] text-slate-500 mt-3">
            Connect to Gemini API for full capabilities
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAIChatbot;
