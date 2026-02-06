import React from 'react';
import { AlertCircle, Heart, Phone as PhoneIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AnxietyAlert({ level, onCalm, onSwitchToPhone, onDismiss }) {
  if (level < 5) return null;

  const getSeverityColor = () => {
    if (level >= 8) return 'from-red-100 to-red-50 border-red-300';
    if (level >= 6) return 'from-orange-100 to-orange-50 border-orange-300';
    return 'from-yellow-100 to-yellow-50 border-yellow-300';
  };

  const getIcon = () => {
    if (level >= 8) return <AlertCircle className="w-6 h-6 text-red-600" />;
    return <Heart className="w-6 h-6 text-orange-600" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mx-4 mb-4 p-4 rounded-xl border-2 bg-gradient-to-r ${getSeverityColor()} shadow-lg`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-2">
            {level >= 8 ? 'High Anxiety Detected' : 'Some Worry Detected'}
          </h3>
          <p className="text-sm text-slate-700 mb-3">
            I notice you might be feeling {level >= 8 ? 'very worried' : 'a bit anxious'}. Let me help you feel better.
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={onCalm}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Heart className="w-4 h-4 mr-1" />
              Share a calming memory
            </Button>
            
            {level >= 7 && (
              <Button
                size="sm"
                onClick={onSwitchToPhone}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Call for support
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDismiss}
              className="text-slate-600"
            >
              I'm okay
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}