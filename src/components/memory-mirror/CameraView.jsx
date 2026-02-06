import React from 'react';
import { Video } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CameraView({ label, status }) {
  return (
    <div className="bg-slate-800 border-2 border-emerald-900 rounded-xl p-4">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
        <Video className="w-4 h-4" />
        {label}
      </div>
      <div className="text-slate-400 text-sm mb-3">● Active - {status}</div>
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 rounded-lg h-24 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        />
        <span className="text-emerald-400 text-sm font-semibold tracking-wider">SECURE</span>
      </div>
    </div>
  );
}