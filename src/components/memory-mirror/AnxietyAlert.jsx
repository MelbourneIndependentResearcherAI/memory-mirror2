import React from 'react';
import { AlertCircle, Phone, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AnxietyAlert({ anxietyLevel, suggestedMode, onModeSwitch, onDismiss }) {
  if (anxietyLevel < 6) return null;

  const getModeIcon = (mode) => {
    if (mode === 'phone') return <Phone className="w-4 h-4" />;
    if (mode === 'chat') return <MessageCircle className="w-4 h-4" />;
    return null;
  };

  const getModeLabel = (mode) => {
    if (mode === 'phone') return 'Talk to Someone';
    if (mode === 'chat') return 'Chat with Me';
    return 'Switch Mode';
  };

  const getMessage = () => {
    if (anxietyLevel >= 8) {
      return "I sense you might be feeling worried. Would you like to talk to someone who can help?";
    }
    return "I'm here for you. Let's take a moment to focus on something comforting.";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-4 my-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-slate-700 font-medium mb-3">{getMessage()}</p>
          
          <div className="flex flex-wrap gap-2">
            {suggestedMode && (
              <Button
                onClick={onModeSwitch}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {getModeIcon(suggestedMode)}
                {getModeLabel(suggestedMode)}
              </Button>
            )}
            <Button
              onClick={onDismiss}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <X className="w-4 h-4" />
              I'm Okay
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}