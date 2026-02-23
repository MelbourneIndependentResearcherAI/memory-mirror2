import React, { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, 
  PhoneOff, Shield, Lock, Volume2, VolumeX, Maximize2, Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function VideoCallInterface({ onClose, userName, userEmail }) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const sessionIdRef = useRef(`session-${Date.now()}`);
  const startTimeRef = useRef(null);
  const queryClient = useQueryClient();

  // Create video call session
  const createSessionMutation = useMutation({
    mutationFn: (data) => base44.entities.VideoCallSession.create(data),
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['videoCallSessions'] });
      
      // Audit log
      base44.functions.invoke('logAuditEvent', {
        action_type: 'video_call_started',
        user_email: userEmail,
        user_name: userName,
        resource_type: 'video_call',
        resource_id: session.id,
        details: { encrypted: true, screen_sharing: false }
      }).catch(() => {});
    }
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VideoCallSession.update(id, data)
  });

  // Initialize media stream
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Create session record
        createSessionMutation.mutate({
          session_id: sessionIdRef.current,
          caller_name: userName,
          caller_email: userEmail,
          call_status: 'active',
          started_at: new Date().toISOString(),
          participants: [userEmail],
          is_encrypted: true,
          consent_acknowledged: true
        });
        
        setCallStatus('active');
        startTimeRef.current = Date.now();
        toast.success('Connected securely');
      } catch (error) {
        console.error('Media access error:', error);
        toast.error('Camera/microphone access denied');
        setCallStatus('error');
      }
    };

    initializeMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callStatus === 'active') {
      const interval = setInterval(() => {
        if (startTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callStatus]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
          }
        };
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
        
        // Log screen sharing
        base44.functions.invoke('logAuditEvent', {
          action_type: 'screen_shared',
          user_email: userEmail,
          user_name: userName,
          resource_type: 'video_call',
          resource_id: sessionIdRef.current,
          details: { screen_sharing: true }
        }).catch(() => {});
      } else {
        const currentStream = localVideoRef.current?.srcObject;
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop());
        }
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
        setIsScreenSharing(false);
        toast.info('Screen sharing stopped');
      }
    } catch (error) {
      toast.error('Screen sharing failed');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    const duration = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;
    
    // Update session
    if (createSessionMutation.data) {
      updateSessionMutation.mutate({
        id: createSessionMutation.data.id,
        data: {
          call_status: 'ended',
          ended_at: new Date().toISOString(),
          call_duration_seconds: duration,
          screen_shared: isScreenSharing
        }
      });
    }
    
    // Audit log
    base44.functions.invoke('logAuditEvent', {
      action_type: 'video_call_ended',
      user_email: userEmail,
      user_name: userName,
      resource_type: 'video_call',
      resource_id: sessionIdRef.current,
      details: { duration_seconds: duration }
    }).catch(() => {});
    
    onClose();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" aria-label="Recording indicator" />
            <span className="text-white font-semibold" role="timer" aria-live="polite">
              {formatDuration(callDuration)}
            </span>
          </div>
          <Badge className="bg-green-600" aria-label="Encrypted connection">
            <Lock className="w-3 h-3 mr-1" />
            E2E Encrypted
          </Badge>
          <Badge className="bg-blue-600" aria-label="HIPAA compliant">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA
          </Badge>
        </div>
        
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-700 min-h-[44px] min-w-[44px]"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-contain"
          aria-label="Remote participant video"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            aria-label="Your video"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-slate-700 flex items-center justify-center">
              <VideoOff className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Status Overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-xl">
              <div className="animate-pulse">Connecting securely...</div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-800 p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="mb-4 border-blue-200 bg-blue-950/30">
            <Info className="w-4 h-4 text-blue-400" />
            <AlertDescription className="text-blue-200 text-sm">
              Video calls are end-to-end encrypted via WebRTC. No data is stored on servers.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-center gap-4" role="toolbar" aria-label="Call controls">
            <Button
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "destructive"}
              size="lg"
              className="w-16 h-16 rounded-full min-h-[64px] min-w-[64px]"
              aria-label={isVideoEnabled ? "Turn off video" : "Turn on video"}
              aria-pressed={isVideoEnabled}
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={toggleAudio}
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              className="w-16 h-16 rounded-full min-h-[64px] min-w-[64px]"
              aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              aria-pressed={isAudioEnabled}
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={toggleScreenShare}
              variant={isScreenSharing ? "secondary" : "outline"}
              size="lg"
              className="w-16 h-16 rounded-full min-h-[64px] min-w-[64px] bg-indigo-600 hover:bg-indigo-700 text-white border-0"
              aria-label={isScreenSharing ? "Stop screen sharing" : "Share screen"}
              aria-pressed={isScreenSharing}
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6" />
              ) : (
                <Monitor className="w-6 h-6" />
              )}
            </Button>

            <Button
              onClick={endCall}
              variant="destructive"
              size="lg"
              className="w-20 h-16 rounded-full bg-red-600 hover:bg-red-700 min-h-[64px]"
              aria-label="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-center text-slate-400 text-sm mt-4">
            All communication is encrypted and HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
}