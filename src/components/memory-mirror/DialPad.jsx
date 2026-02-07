import React from 'react';
import { motion } from 'framer-motion';

const digits = [
  { number: '1', letters: '' },
  { number: '2', letters: 'ABC' },
  { number: '3', letters: 'DEF' },
  { number: '4', letters: 'GHI' },
  { number: '5', letters: 'JKL' },
  { number: '6', letters: 'MNO' },
  { number: '7', letters: 'PQRS' },
  { number: '8', letters: 'TUV' },
  { number: '9', letters: 'WXYZ' },
  { number: '*', letters: '' },
  { number: '0', letters: '+' },
  { number: '#', letters: '' },
];

export default function DialPad({ onPress }) {
  const handlePress = (number) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // DTMF tone feedback
    const frequencies = { 
      '1': 697, '2': 697, '3': 697, 
      '4': 770, '5': 770, '6': 770, 
      '7': 852, '8': 852, '9': 852, 
      '*': 941, '0': 941, '#': 941 
    };
    
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequencies[number] || 770;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
      // Fallback if AudioContext not supported
    }
    
    onPress(number);
  };

  return (
    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto px-6">
      {digits.map(({ number, letters }) => (
        <motion.button
          key={number}
          onClick={() => handlePress(number)}
          whileTap={{ scale: 0.92 }}
          className="relative h-20 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 text-slate-900 dark:text-white rounded-full shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center border border-slate-300 dark:border-slate-600 active:shadow-inner"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 -2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <span className="text-3xl font-semibold tracking-tight">{number}</span>
          {letters && (
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wider mt-0.5">
              {letters}
            </span>
          )}
        </motion.button>
      ))}
    </div>
  );
}