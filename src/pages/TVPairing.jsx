import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Tv, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function TVPairing() {
  const navigate = useNavigate();
  const [pairingCode, setPairingCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const generatePairingCode = async () => {
    setIsGenerating(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      const connection = await base44.entities.TVConnection.create({
        pairing_code: code,
        device_name: 'Smart TV',
        is_active: true,
        last_connected: new Date().toISOString(),
        tv_settings: {
          text_size: 'extra-large',
          voice_enabled: true,
          auto_scroll: true
        }
      });
      
      setPairingCode(code);
      setConnectionId(connection.id);
      toast.success('Pairing code generated!');
      
      // Start checking for TV connection
      startConnectionCheck(connection.id);
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error('Failed to generate pairing code');
    } finally {
      setIsGenerating(false);
    }
  };

  const startConnectionCheck = (connId) => {
    setIsChecking(true);
    const interval = setInterval(async () => {
      try {
        const connection = await base44.entities.TVConnection.get(connId);
        if (connection.device_name !== 'Smart TV') {
          clearInterval(interval);
          setIsChecking(false);
          toast.success('TV Connected Successfully!');
          setTimeout(() => navigate('/tv-mode'), 1000);
        }
      } catch (error) {
        console.error('Connection check failed:', error);
      }
    }, 3000);

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false);
    }, 600000);
  };

  const openTVMode = () => {
    const url = `${window.location.origin}/#/tv-mode`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    generatePairingCode();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Tv className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Connect to Smart TV
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Use Memory Mirror on your large screen for better visibility
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 border-4 border-blue-200 dark:border-blue-800">
              <h2 className="text-2xl font-bold text-center mb-4 text-slate-900 dark:text-slate-100">
                Your Pairing Code
              </h2>
              {pairingCode ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center">
                  <div className="text-7xl font-bold tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                    {pairingCode.match(/.{1,3}/g).join(' ')}
                  </div>
                  {isChecking && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mt-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Waiting for TV connection...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                </div>
              )}
              
              <Button
                onClick={generatePairingCode}
                disabled={isGenerating}
                variant="outline"
                className="w-full mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate New Code
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Setup Instructions
              </h3>
              
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Open TV Browser</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      On your Smart TV, open the web browser
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Navigate to TV Mode</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Visit this URL on your TV:
                    </p>
                    <code className="text-sm bg-white dark:bg-slate-900 px-3 py-2 rounded border border-slate-200 dark:border-slate-700 block">
                      {window.location.origin}/#/tv-mode
                    </code>
                    <Button
                      onClick={openTVMode}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Open TV Mode Preview
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Enter Pairing Code</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Enter the 6-digit code shown above when prompted on your TV
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-bold shrink-0">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Start Using</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Use your TV remote to navigate and interact with Memory Mirror
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                📺 TV Mode Features
              </h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• Extra large text optimized for viewing from distance</li>
                <li>• Remote control navigation (arrow keys + OK button)</li>
                <li>• Voice interaction with enhanced audio output</li>
                <li>• Photo galleries on the big screen</li>
                <li>• Music and story playback with TV speakers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}