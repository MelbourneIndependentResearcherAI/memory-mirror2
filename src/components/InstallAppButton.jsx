import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      toast.success('App installed! Access it from your home screen.');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS or if prompt not available
      toast.info('On iPhone: Tap Share → "Add to Home Screen"\nOn Android: Tap menu → "Install app"', {
        duration: 5000
      });
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
      setIsInstalled(true);
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if no prompt available
  if (!showPrompt && !deferredPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white gap-2"
    >
      <Download className="w-4 h-4" />
      Download to Home Screen
    </Button>
  );
}