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
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <span className="text-3xl">📋</span>
                Step-by-Step Instructions
              </h3>
              
              <div className="grid gap-4">
                <div className="flex gap-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      📱 Code Generated (Done!)
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Your unique 6-digit pairing code is ready above. Keep this page open.
                    </p>
                    <div className="mt-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-2">
                      <p className="text-xs text-green-800 dark:text-green-300 font-medium">
                        ✓ Code is active and waiting for TV connection
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full font-bold text-xl shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      🖥️ Open Your TV Browser
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      On your Smart TV (Samsung, LG, Sony, etc.), find and open the <strong>Web Browser</strong> app
                    </p>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 text-sm">
                      <p className="text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span>💡</span>
                        <span><strong>Can't find browser?</strong> Look for "Internet", "Browser", or "Web" in your TV's app menu</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full font-bold text-xl shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      🌐 Visit TV Mode URL
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      In the TV browser's address bar, carefully type:
                    </p>
                    <div className="bg-indigo-600 text-white rounded-lg p-3 text-center mb-2">
                      <code className="text-lg font-mono font-bold">
                        {window.location.origin}/#/tv-mode
                      </code>
                    </div>
                    <Button
                      onClick={openTVMode}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      📱 Open Preview on This Device
                    </Button>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                      (Use preview to see what it looks like, but enter code on actual TV)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-center w-12 h-12 bg-amber-600 text-white rounded-full font-bold text-xl shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                      🔢 Enter Your Pairing Code
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      When the TV shows the pairing screen, use your <strong>TV remote's number buttons</strong> to enter:
                    </p>
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 text-center mb-2">
                      <p className="text-4xl font-bold tracking-[0.3em]">
                        {pairingCode || '●●●●●●'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Press <strong className="text-blue-600 dark:text-blue-400">OK</strong> or <strong className="text-blue-600 dark:text-blue-400">Enter</strong> on your remote when finished
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border-2 border-green-300 dark:border-green-700">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-2xl shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-green-700 dark:text-green-400 mb-2">
                      🎉 You're Connected!
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Once paired, Memory Mirror will display on your TV with:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span><strong>Extra-large text</strong> - Readable from across the room</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span><strong>Voice interaction</strong> - Press mic button to talk</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span><strong>Remote navigation</strong> - Use ↑↓ arrows and OK button</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span><strong>Full AI companion</strong> - Complete conversation support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="text-2xl">📺</span>
                What You'll Get with TV Mode
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">📝</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Extra-large text</strong> - Easy to read from 10+ feet away</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🎮</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Remote control</strong> - Navigate with arrow keys & OK button</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🎤</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Voice commands</strong> - Talk naturally via microphone button</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🔊</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>TV speakers</strong> - AI responds through your surround sound</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">📸</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Photo galleries</strong> - View memories on the big screen</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 dark:text-blue-400 text-lg">🎵</span>
                  <span className="text-slate-700 dark:text-slate-300"><strong>Music & stories</strong> - Immersive playback experience</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-5">
              <p className="text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <span>
                  <strong>Keep this page open</strong> until your TV connects. This page will automatically detect when your TV pairs successfully and notify you.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}