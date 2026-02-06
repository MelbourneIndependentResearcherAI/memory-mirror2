import React, { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { speakWithEmotion } from './VoiceSynthesis';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice } from '@/utils/voiceUtils';

const emergencyPrompt = `You're a caring emergency operator for someone with dementia:

1. NEVER dismiss their concerns - validate all feelings
2. Assess if there's a real emergency (fire, injury, immediate danger)
3. If no real emergency, reassure them: "Help is on the way", "It's already being handled", "Your family has been notified"
4. Guide them to a calmer emotional state
5. Be professional but warm and patient
6. If they mention being scared or unsafe, reassure them extensively

After your response, output META: {"realEmergency": true/false, "anxiety": 0-10, "concern": "brief description"}`;

export default function CallScreen({ phoneNumber, contactName, onEndCall }) {
  const [callStatus, setCallStatus] = useState('Calling...');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    // Simulate connection
    const timer = setTimeout(() => {
      setCallStatus('Connected');
      const greeting = getOperatorGreeting(phoneNumber);
      setMessages([{ role: 'operator', content: greeting }]);
      setConversationHistory([{ role: 'assistant', content: greeting }]);
      speakResponse(greeting);
    }, 2000);

    return () => clearTimeout(timer);
  }, [phoneNumber]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const getOperatorGreeting = (number) => {
    const greetings = {
      '911': "911, what's your emergency? I'm here to help you.",
      '999': "Police emergency line, how can I help you today?",
      '411': "Directory assistance, how may I help you?",
      '211': "Support services, what do you need help with today?"
    };
    return greetings[number] || "Hello, how can I help you today?";
  };

  const speakResponse = (text) => {
    speakWithRealisticVoice(text, {
      rate: 0.88,
      pitch: 1.0,
      volume: 1.0
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    const newHistory = [...conversationHistory, { role: 'user', content: userMessage }];
    setConversationHistory(newHistory);
    setIsLoading(true);
    setCallStatus('Operator responding...');

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${emergencyPrompt}\n\nCall to: ${phoneNumber} (${contactName})\n\nConversation:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nRespond as the operator.`,
      });

      let assistantMessage = typeof response === 'string' && response.includes('META:')
        ? response.split('META:')[0].trim()
        : response;

      setMessages(prev => [...prev, { role: 'operator', content: assistantMessage }]);
      setConversationHistory(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speakResponse(assistantMessage);
      setCallStatus('Connected');

    } catch (error) {
      const fallback = "Can you repeat that? I want to make sure I help you properly.";
      setMessages(prev => [...prev, { role: 'operator', content: fallback }]);
      setCallStatus('Connected');
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900 min-h-[500px] p-6 flex flex-col">
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ repeat: callStatus === 'Calling...' ? Infinity : 0, duration: 2 }}
        className={`text-center text-lg mb-4 ${callStatus === 'Connected' ? 'text-emerald-400' : 'text-slate-400'}`}
      >
        {callStatus}
      </motion.div>

      <div className="bg-slate-800 rounded-2xl p-4 mb-4 text-center">
        <div className="text-emerald-400 text-lg mb-1">{contactName}</div>
        <div className="text-white text-2xl font-mono tracking-wider">{phoneNumber}</div>
      </div>

      <div 
        ref={chatRef}
        className="flex-1 bg-slate-800 rounded-2xl p-4 mb-4 max-h-64 overflow-y-auto"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 p-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-emerald-800 text-white text-right ml-8' 
                : 'bg-blue-900 text-white mr-8'
            }`}
          >
            {msg.content}
          </motion.div>
        ))}
        {isLoading && (
          <div className="text-slate-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Responding...
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Speak your concern..."
          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
        />
        <Button 
          onClick={sendMessage} 
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
        >
          <PhoneOff className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}