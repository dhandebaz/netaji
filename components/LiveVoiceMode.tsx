
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, X, Activity, Volume2, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllPoliticians } from '../services/dataService';

interface Props {
  onClose: () => void;
}

export const LiveVoiceMode: React.FC<Props> = ({ onClose }) => {
  const [isListening, setIsListening] = useState(true);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'speaking' | 'error'>('connecting');
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  // Refs for cleanup
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    let isActive = true;

    const initSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Context for the AI
        const politicians = getAllPoliticians();
        const contextData = politicians.map(p => ({
            name: p.name,
            party: p.party,
            state: p.state,
            assets: `${p.totalAssets} Cr`,
            cases: p.criminalCases,
            status: p.status
        }));

        const systemInstruction = `
            You are Neta Voice Assistant, a political analyst assistant. 
            Speak naturally, concisely, and objectively.
            Here is the live data you have access to: ${JSON.stringify(contextData)}.
            If asked about someone not in the list, say you don't have their live data yet.
            Keep answers short (under 3 sentences) as this is a voice conversation.
        `;

        // Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 }); // Output rate
        audioContextRef.current = ctx;

        // Input Context (16kHz required for Gemini)
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        
        // Connect to Gemini Live
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemInstruction,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            }
          },
          callbacks: {
            onopen: async () => {
              if (!isActive) return;
              setStatus('connected');
              console.info("[Live Voice] Session Opened");

              // Start Microphone
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                
                const source = inputCtx.createMediaStreamSource(stream);
                sourceRef.current = source;

                // Analyze volume for visuals
                const analyzer = inputCtx.createAnalyser();
                analyzer.fftSize = 256;
                source.connect(analyzer);
                const dataArray = new Uint8Array(analyzer.frequencyBinCount);
                
                // Volume visualizer loop
                const updateVolume = () => {
                    if (!isActive) return;
                    analyzer.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setVolumeLevel(avg);
                    requestAnimationFrame(updateVolume);
                };
                updateVolume();

                // Processor for streaming audio
                const processor = inputCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;
                
                processor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Convert Float32 to Int16 PCM Base64
                    const base64Data = float32ToB64PCM(inputData);
                    
                    if (isActive && sessionPromise) {
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({ 
                                media: { 
                                    mimeType: 'audio/pcm;rate=16000', 
                                    data: base64Data 
                                } 
                            });
                        });
                    }
                };

                source.connect(processor);
                processor.connect(inputCtx.destination);

              } catch (err) {
                console.error("Mic Error:", err);
                setStatus('error');
              }
            },
            onmessage: async (msg: LiveServerMessage) => {
                if (!isActive) return;
                
                // Handle Audio Output
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) {
                    setStatus('speaking');
                    const audioBuffer = await base64ToAudioBuffer(audioData, ctx);
                    playAudioBuffer(audioBuffer, ctx);
                }

                // Handle Turn Complete (Back to listening state visually)
                if (msg.serverContent?.turnComplete) {
                    setTimeout(() => {
                        if (isActive) setStatus('connected');
                    }, 1000); // Small buffer to let audio finish
                }
            },
            onclose: () => {
                console.info("[Live Voice] Closed");
            },
            onerror: (e) => {
                console.error("[Live Voice] Error", e);
                setStatus('error');
            }
          }
        });
        
        sessionPromiseRef.current = sessionPromise;
      } catch (error) {
        console.error("Connection failed", error);
        setStatus('error');
      }
    };

    initSession();

    return () => {
      isActive = false;
      // Cleanup
      streamRef.current?.getTracks().forEach(t => t.stop());
      sourceRef.current?.disconnect();
      processorRef.current?.disconnect();
      audioContextRef.current?.close();
      
      // Stop all queued audio
      audioQueueRef.current.forEach(node => {
          try { node.stop(); } catch(e) {}
      });

      // Close session
      if (sessionPromiseRef.current) {
          sessionPromiseRef.current.then(session => session.close());
      }
    };
  }, []);

  // --- Audio Helpers ---

  const playAudioBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      // Schedule playback
      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      source.start(startTime);
      
      nextStartTimeRef.current = startTime + buffer.duration;
      
      source.onended = () => {
          audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
      };
      audioQueueRef.current.push(source);
  };

  const base64ToAudioBuffer = async (base64: string, ctx: AudioContext) => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create simple PCM buffer
      const int16Data = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(int16Data.length);
      for (let i = 0; i < int16Data.length; i++) {
          float32Data[i] = int16Data[i] / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);
      return buffer;
  };

  const float32ToB64PCM = (float32: Float32Array) => {
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
          let s = Math.max(-1, Math.min(1, float32[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      let binary = '';
      const bytes = new Uint8Array(int16.buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
  };

  // --- Render ---

  return (
    <div className="absolute inset-0 bg-slate-950 text-white flex flex-col z-20">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                <span className="font-bold text-sm tracking-widest uppercase text-slate-300">Live Feed</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
            </button>
        </div>

        {/* Visualizer */}
        <div className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Background Orbs */}
            <motion.div 
                animate={{ 
                    scale: status === 'speaking' ? [1, 1.5, 1] : 1,
                    opacity: status === 'speaking' ? 0.4 : 0.1
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute w-64 h-64 bg-blue-600 rounded-full blur-[80px]"
            />
            
            {/* Status Text */}
            <div className="absolute top-8 text-center">
                <h3 className="text-lg font-medium text-slate-200">
                    {status === 'connecting' && "Establishing secure link..."}
                    {status === 'connected' && "Listening..."}
                    {status === 'speaking' && "Assistant Speaking..."}
                    {status === 'error' && "Connection disrupted"}
                </h3>
            </div>

            {/* Main Orb */}
            <div className="relative z-10">
                <motion.div
                    animate={{
                        scale: status === 'speaking' ? [1, 1.2, 1] : [1, 1.05, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                        status === 'speaking' ? 'bg-white shadow-[0_0_50px_rgba(255,255,255,0.5)]' : 
                        status === 'error' ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)]' :
                        'bg-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.5)]'
                    }`}
                >
                    {/* Mic Icon inside Orb */}
                    <Mic size={40} className={`text-white ${status === 'speaking' ? 'text-slate-900' : ''}`} />
                </motion.div>
                
                {/* User Voice Ripple */}
                {status === 'connected' && (
                    <div 
                        className="absolute inset-0 rounded-full border-2 border-white opacity-50"
                        style={{ transform: `scale(${1 + volumeLevel / 50})` }}
                    ></div>
                )}
            </div>

        </div>

        {/* Controls */}
        <div className="p-6 pb-8 flex justify-center gap-6 bg-gradient-to-t from-black/50 to-transparent">
            <button 
                onClick={() => setIsListening(!isListening)}
                className={`p-4 rounded-full transition-all ${isListening ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-400'}`}
            >
                {isListening ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button 
                 className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
                <Volume2 size={24} />
            </button>
        </div>
    </div>
  );
};
