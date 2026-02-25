import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice } from './voiceUtils';

const emergencyPrompt = `You are an empathetic emergency operator specially trained in dementia care. The person you're speaking with may be confused, scared, or disoriented. Your role:

1. Remain calm, patient, and reassuring at all times
2. Validate their concerns without dismissing them
3. Use simple, clear language - short sentences
4. Repeat information if needed without frustration
5. Redirect anxiety with gentle reassurance
6. Remind them they're safe and help is available
7. If they mention family, assure them family has been notified
8. For paranoia/fear concerns, acknowledge feelings then reassure
9. Use their concerns to build trust, then gently redirect to calming topics

Keep responses under 40 words. Be warm, human, and professional.`;

export default function CallScreen({ phoneNumber, contactName, onEndCall }) {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      
      const greeting = "Hello, this is your emergency support operator. I'm here to help you. Can you tell me what's going on?";
      setMessages([{ role: 'assistant', content: greeting }]);
      setConversationHistory([{ role: 'assistant', content: greeting }]);
      
      speakWithRealisticVoice(greeting, {
        rate: 0.85,
        pitch: 0.98,
        volume: 1.0
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${emergencyPrompt}\n\nConversation:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nRespond as the operator with maximum warmth and reassurance.`,
      });

      const operatorMessage = typeof response === 'string' ? response : "I'm here with you. Everything is going to be okay.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: operatorMessage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: operatorMessage }]);
      
      speakWithRealisticVoice(operatorMessage, {
        rate: 0.85,
        pitch: 0.98,
        volume: 1.0
      });

    } catch (_error) {
      const fallback = "I'm right here with you. You're safe. Take a deep breath with me.";
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }]);
      speakWithRealisticVoice(fallback);
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[500px] py-8 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-black dark:to-slate-950">
      <div className="text-center flex-1 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-5xl mb-8 shadow-2xl border-4 border-slate-500/50"
        >
          {contactName ? contactName[0].toUpperCase() : '👤'}
        </motion.div>
        
        <h2 className="text-3xl font-semibold mb-2 text-white">{contactName || 'Emergency Operator'}</h2>
        <p className="text-slate-400 text-lg mb-8">{phoneNumber}</p>
        
        {isConnecting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-slate-400"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-base">Connecting...</span>
          </motion.div>
        )}

        {isConnected && (
          <>
            <div className="mb-8">
              <div className="text-slate-400 mb-4 text-sm uppercase tracking-wide">Operator Status</div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 flex items-center justify-center gap-3 text-lg"
              >
                <motion.span 
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-4 h-4 rounded-full bg-green-400"
                />
                Connected & Listening
              </motion.p>
            </div>

            <div className="bg-slate-800/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-2xl p-5 max-w-md w-full space-y-4 max-h-64 overflow-y-auto border border-slate-700/50 mb-6">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${
                    msg.role === 'user'
                      ? 'bg-slate-700 dark:bg-slate-800 text-white'
                      : 'bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-100'
                  } rounded-2xl p-4 text-sm shadow-lg`}
                >
                  <p className="font-semibold mb-1.5 text-xs opacity-80 uppercase tracking-wide">
                    {msg.role === 'user' ? 'You' : 'Operator'}
                  </p>
                  <p className="leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-4 text-sm shadow-lg"
                >
                  <div className="flex items-center gap-2 text-emerald-200">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="italic">Operator is responding...</span>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex gap-2 max-w-md w-full px-4 mb-6">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[44px]"
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                whileTap={{ scale: 0.95 }}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </>
        )}
      </div>

      <motion.button
        onClick={onEndCall}
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-16 py-6 rounded-full text-lg font-semibold shadow-2xl transition-all min-h-[64px] border-2 border-red-400"
      >
        End Call
      </motion.button>
    </div>
  );
}