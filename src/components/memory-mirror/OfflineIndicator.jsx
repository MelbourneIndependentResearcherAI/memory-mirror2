import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-gradient-to-r from-amber-900 to-orange-900 text-white px-4 py-3 flex items-center gap-2 z-50 border-b border-amber-700"
    >
      <motion.div
        animate={{ opacity: [1, 0.6, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <WifiOff className="w-4 h-4" />
      </motion.div>
      <span className="text-sm font-medium">Offline Mode - Using cached responses</span>
    </motion.div>
  );
}