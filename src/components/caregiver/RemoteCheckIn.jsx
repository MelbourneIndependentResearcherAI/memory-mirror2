import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, X, Volume2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function RemoteCheckIn({ onClose, nightWatchActive = false }) {
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [audioLevel, setAudioLevel] = useState(0);
  const localVideoRef = useRef(null);
  const _remoteVideoRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      stopAllStreams();
    };
  }, []);

  const startAudioCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      setIsAudioActive(true);
      setConnectionStatus('connected');
      
      // Setup audio level monitoring
      setupAudioMonitoring(stream);
      
      toast.success('Audio call connected');
    } catch (error) {
      console.error('Audio call failed:', error);
      toast.error('Unable to start audio. Check microphone permissions.');
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsVideoActive(true);
      setIsAudioActive(true);
      setConnectionStatus('connected');
      
      setupAudioMonitoring(stream);
      
      toast.success('Video call connected');
    } catch (error) {
      console.error('Video call failed:', error);
      toast.error('Unable to start video. Check camera/microphone permissions.');
    }
  };

  const setupAudioMonitoring = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    // Monitor audio levels
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const monitorLevels = () => {
      if (!analyserRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(Math.min(100, average));
      
      requestAnimationFrame(monitorLevels);
    };
    
    monitorLevels();
  };

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoActive;
      });
      setIsVideoActive(!isVideoActive);
    }
  };

  const stopAllStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsAudioActive(false);
    setIsVideoActive(false);
    setConnectionStatus('disconnected');
  };

  const endCall = () => {
    stopAllStreams();
    toast.info('Call ended');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">Remote Check-In</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${
                connectionStatus === 'connected' ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                {connectionStatus === 'connected' ? '🟢 Connected' : '⚪ Not Connected'}
              </Badge>
              {nightWatchActive && (
                <Badge className="bg-blue-600">Night Watch Active</Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Video Display */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Video (Caregiver) */}
              <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                {isVideoActive ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Camera className="w-16 h-16 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Your camera is off</p>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                  You (Caregiver)
                </div>
              </div>

              {/* Remote Video (Loved One) - Simulated */}
              <div className="relative bg-slate-800 rounded-lg overflow-hidden aspect-video">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <Video className="w-16 h-16 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Loved One's View</p>
                    <p className="text-xs mt-1 opacity-60">
                      (In production: live video feed)
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
                  Loved One
                </div>
              </div>
            </div>

            {/* Audio Level Indicator */}
            {isAudioActive && !isMuted && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Volume2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-slate-300">Audio Level</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4">
              {connectionStatus === 'disconnected' ? (
                <>
                  <Button
                    onClick={startAudioCall}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    Audio Only
                  </Button>
                  <Button
                    onClick={startVideoCall}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <Video className="w-5 h-5" />
                    Video Call
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={toggleMute}
                    variant={isMuted ? 'destructive' : 'secondary'}
                    size="lg"
                    className="gap-2"
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </Button>
                  
                  {isVideoActive && (
                    <Button
                      onClick={toggleVideo}
                      variant="secondary"
                      size="lg"
                      className="gap-2"
                    >
                      {isVideoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      Camera
                    </Button>
                  )}
                  
                  <Button
                    onClick={endCall}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <Phone className="w-5 h-5 rotate-135" />
                    End Call
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Remote Check-In Guide</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300 space-y-2">
            <p>✓ <strong>Audio Only:</strong> Quick voice check without video</p>
            <p>✓ <strong>Video Call:</strong> See and speak with your loved one</p>
            <p>✓ <strong>Night Watch Integration:</strong> View real-time monitoring data during call</p>
            <p className="text-xs text-yellow-400 mt-3">
              Note: In production, this connects to the loved one's device for live audio/video communication
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}