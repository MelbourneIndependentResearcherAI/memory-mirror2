import React from 'react';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatMessage({ message, isAssistant, hasVoice, onSpeak }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mb-4 ${isAssistant ? 'text-left' : 'text-right'}`}
    >
      <div
        className={`
          inline-block max-w-[80%] px-4 py-3 rounded-2xl relative
          ${isAssistant 
            ? 'bg-blue-50 text-blue-900 rounded-bl-sm' 
            : 'bg-slate-600 text-white rounded-br-sm'}
        `}
      >
        <p className="text-base leading-relaxed">{message}</p>
        
        {hasVoice && isAssistant && (
          <button
            onClick={onSpeak}
            className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-emerald-600 transition-colors"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}