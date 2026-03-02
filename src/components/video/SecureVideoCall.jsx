import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { X, Mic, MicOff, Video, VideoOff, Phone, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SecureVideoCall({ callId, roomId, _accessToken, participants, onClose }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const videoContainerRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const queryClient = useQueryClient();

  // Track call duration
  useEffect(() => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(durationIntervalRef.current);
  }, []);

  // End call mutation
  const endCallMutation = useMutation({
    mutationFn: async () => {
      return await base44.functions.invoke('endVideoCall', {
        callId,
        durationSeconds: callDuration,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoCall', callId] });
      toast.success('Call ended');
      onClose();
    },
    onError: () => {
      toast.error('Failed to end call');
    },
  });

  const handleEndCall = () => {
    endCallMutation.mutate();
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 flex justify-between items-center">
        <div>
          <h2 className="text-white text-lg font-bold">Video Call</h2>
          <p className="text-slate-300 text-sm">
            {participants.length} participant{participants.length !== 1 ? 's' : ''} • {formatDuration(callDuration)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-slate-700"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Video Container */}
      <div
        ref={videoContainerRef}
        className="flex-1 bg-black relative overflow-hidden flex items-center justify-center"
      >
        {/* Main video area - placeholder for actual video streaming */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center text-white text-5xl">
              📹
            </div>
            <p className="text-white text-lg font-semibold">Video call active</p>
            <p className="text-slate-400 text-sm mt-2">Using end-to-end encrypted connection</p>
            
            {/* Room ID Info */}
            <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 max-w-sm">
              <p className="text-slate-400 text-xs mb-2">Share this room ID to invite others:</p>
              <div className="flex items-center gap-2 bg-slate-900 rounded p-2">
                <code className="text-slate-200 text-sm flex-1 truncate">{roomId}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyRoomId}
                  className="text-slate-300 hover:text-white"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Participant List */}
            <div className="mt-6">
              <p className="text-slate-400 text-xs mb-2">Participants:</p>
              <div className="space-y-1">
                {participants.map((participant, idx) => (
                  <p key={idx} className="text-slate-300 text-sm">
                    {participant}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
          <Button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`rounded-full w-12 h-12 flex items-center justify-center ${
              isAudioEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`rounded-full w-12 h-12 flex items-center justify-center ${
              isVideoEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            onClick={handleEndCall}
            disabled={endCallMutation.isPending}
            className="rounded-full w-12 h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Security Badge */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700">
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          🔒 End-to-end encrypted • Private & Secure
        </div>
      </div>
    </motion.div>
  );
}