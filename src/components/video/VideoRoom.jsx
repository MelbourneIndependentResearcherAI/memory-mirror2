import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff,
  PhoneOff, Maximize2, Lock, Copy, Users, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

export default function VideoRoom({ roomId, roomName, userEmail, userName, isHost, sessionId, onLeave }) {
  const [localStream, setLocalStream] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState([{ name: userName, email: userEmail, isSelf: true }]);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const peerConnectionsRef = useRef({});
  const channelRef = useRef(null);

  // Real-time presence via entity subscription
  useEffect(() => {
    if (!sessionId) return;
    const unsub = base44.entities.VideoCall.subscribe((event) => {
      if (event.data?.room_id === roomId) {
        const parts = event.data.participants || [];
        setParticipants(
          parts.map((email, i) => ({
            name: email === userEmail ? userName : email,
            email,
            isSelf: email === userEmail,
          }))
        );
      }
    });
    return unsub;
  }, [sessionId, roomId, userEmail]);

  // Initialize local media
  useEffect(() => {
    let stream;
    const init = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // Mark call as active
        if (sessionId) {
          await base44.entities.VideoCall.update(sessionId, { call_status: 'active' });
        }
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          toast.error('Camera/microphone permission denied. Please allow access and try again.');
        } else {
          toast.error('Could not access camera or microphone.');
        }
      }
    };
    init();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Duration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsVideoEnabled(track.enabled); }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) { track.enabled = !track.enabled; setIsAudioEnabled(track.enabled); }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screen;
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;
        screen.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
          screenStreamRef.current = null;
        };
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } catch (_) {
        toast.error('Screen sharing cancelled or not supported');
      }
    } else {
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
      setIsScreenSharing(false);
      toast.info('Screen sharing stopped');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Room link copied! Share it with your companion.');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = async () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(t => t.stop());
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (sessionId) {
      await base44.entities.VideoCall.update(sessionId, {
        call_status: isHost ? 'completed' : 'active',
        ended_at: isHost ? new Date().toISOString() : undefined,
        duration_seconds: duration,
      }).catch(() => {});
    }
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    onLeave();
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const msg = { sender: userName, text: chatInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  };

  const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col select-none">
      {/* Top Bar */}
      <div className="bg-slate-900/90 backdrop-blur px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-white font-semibold truncate max-w-[120px] sm:max-w-xs">{roomName}</span>
          <Badge className="bg-green-600 text-white flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1 animate-pulse" />
            {formatDuration(callDuration)}
          </Badge>
          <Badge className="bg-slate-700 text-slate-200 hidden sm:flex flex-shrink-0">
            <Lock className="w-3 h-3 mr-1" /> Encrypted
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={copyRoomLink}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white hover:bg-slate-700 gap-1"
          >
            {copied ? '✓ Copied' : <><Copy className="w-4 h-4" /><span className="hidden sm:inline">Invite</span></>}
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative overflow-hidden flex">
        {/* Main: self preview (large since no peer WebRTC signaling server in this demo) */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                <span className="text-4xl font-bold text-slate-400">{(userName || 'G')[0].toUpperCase()}</span>
              </div>
              <p className="text-slate-400 text-lg">{userName}</p>
              <p className="text-slate-500 text-sm mt-1">Camera off</p>
            </div>
          )}
          {/* Screen share label */}
          {isScreenSharing && (
            <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
              Sharing Screen
            </div>
          )}

          {/* Waiting for others overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
            <div className="bg-slate-900/70 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200 text-sm">
                Waiting for others to join • Share the invite link above
              </span>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="w-72 bg-slate-900 border-l border-slate-700 flex flex-col">
            <div className="p-3 border-b border-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200 font-semibold text-sm">In-Call Chat</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-slate-500 text-xs text-center mt-4">No messages yet. Say hello!</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === userName ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3 py-2 rounded-xl max-w-[90%] text-sm ${msg.sender === userName ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5">{msg.sender === userName ? 'You' : msg.sender} · {msg.time}</span>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-700 flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-purple-500"
              />
              <Button size="sm" onClick={sendChat} className="bg-purple-600 hover:bg-purple-700">Send</Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-slate-900/95 backdrop-blur px-4 py-5 flex-shrink-0">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {/* Mute */}
          <button
            onClick={toggleAudio}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            aria-label={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            aria-label={isVideoEnabled ? 'Turn off video' : 'Turn on video'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          {/* Screen share */}
          <button
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hidden sm:flex ${isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            aria-label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setShowChat(v => !v)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${showChat ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
            aria-label="Toggle chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* End call */}
          <button
            onClick={handleLeave}
            className="w-16 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all"
            aria-label="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
        <p className="text-center text-slate-500 text-xs mt-3">
          Room: <span className="font-mono text-slate-300">{roomId}</span>
          <button onClick={copyRoomLink} className="ml-2 text-purple-400 hover:text-purple-300 underline text-xs">Copy invite</button>
        </p>
      </div>
    </div>
  );
}