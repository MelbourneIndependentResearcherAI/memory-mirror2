import React from 'react';
import { motion } from 'framer-motion';

const dialButtons = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export default function DialPad({ onPress }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {dialButtons.map(({ digit, letters }) => (
        <motion.button
          key={digit}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPress(digit)}
          className="aspect-square bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600 rounded-full text-white flex flex-col items-center justify-center shadow-lg hover:from-slate-600 hover:to-slate-700 transition-all"
        >
          <span className="text-2xl font-light">{digit}</span>
          {letters && <span className="text-[10px] text-slate-400 -mt-1">{letters}</span>}
        </motion.button>
      ))}
    </div>
  );
}