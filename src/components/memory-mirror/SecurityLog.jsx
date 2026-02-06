import React from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SecurityLog({ entries }) {
  return (
    <div className="bg-slate-800 border-2 border-emerald-900 rounded-xl p-4 max-h-52 overflow-y-auto">
      <h3 className="flex items-center gap-2 text-emerald-400 font-semibold mb-3">
        <ClipboardList className="w-4 h-4" />
        Security Log (Last Hour)
      </h3>
      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`
              p-2 border-l-4 text-sm
              ${entry.status === 'all_clear' 
                ? 'border-emerald-500 text-emerald-400' 
                : 'border-slate-600 text-slate-400'}
            `}
          >
            <CheckCircle className="w-3 h-3 inline mr-2" />
            {entry.time} - {entry.message}
          </motion.div>
        ))}
      </div>
    </div>
  );
}