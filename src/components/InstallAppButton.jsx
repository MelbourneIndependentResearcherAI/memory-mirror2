import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS or if prompt not available
      alert('To install:\n\niPhone/iPad: Tap Share button → "Add to Home Screen"\n\nAndroid: Tap menu (⋮) → "Install app" or "Add to Home screen"');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('App installed');
      setIsInstalled(true);
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
        <Check className="w-5 h-5" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <Button
          onClick={handleInstallClick}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg font-bold min-h-[56px] rounded-xl"
        >
          <Download className="w-6 h-6 mr-3" />
          Download App to Home Screen
          <Smartphone className="w-5 h-5 ml-3" />
        </Button>
        
        {showPrompt && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
            Install for offline access and quick launch
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}