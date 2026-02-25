import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

// --- Memory Selfie Sub-Component ---
function MemorySelfie({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError('Camera access denied or not available on this device.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCaptured(dataUrl);
    stopCamera();
    toast.success('Memory selfie captured!');
  };

  const retake = () => {
    setCaptured(null);
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Memory Selfie</h3>
        <button onClick={handleClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      {cameraError && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
          {cameraError}
        </div>
      )}

      {captured ? (
        <div className="space-y-4">
          <img src={captured} alt="Memory selfie" className="w-full rounded-2xl shadow-lg" />
          <div className="flex gap-3">
            <Button onClick={retake} variant="outline" className="flex-1 min-h-[44px]">
              <Camera className="w-4 h-4 mr-2" />Retake
            </Button>
            <Button onClick={handleClose} className="flex-1 min-h-[44px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90">
              <CheckCircle className="w-4 h-4 mr-2" />Save Memory
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {stream ? (
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl shadow-lg bg-black" />
              <canvas ref={canvasRef} className="hidden" />
              <Button
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-xl min-h-[44px]"
              >
                <Camera className="w-7 h-7" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-4">
              <Camera className="w-16 h-16 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 text-center">Capture a moment to treasure forever</p>
              <Button onClick={startCamera} className="min-h-[44px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90">
                <Camera className="w-4 h-4 mr-2" />Open Camera
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Grateful Moments Sub-Component ---
function GratefulMoments({ onClose }) {
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);
  const prompts = [
    'What made you smile today?',
    'Who are you grateful for right now?',
    'What is one beautiful thing you saw today?',
    'What memory brings you the most joy?',
    'What simple pleasure did you enjoy today?',
  ];
  const [promptIndex] = useState(Math.floor(Math.random() * prompts.length));

  const handleSave = () => {
    if (!entry.trim()) {
      toast.error('Please write something before saving');
      return;
    }
    setSaved(true);
    toast.success('Grateful moment saved! 💛');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Grateful Moments</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      {saved ? (
        <div className="flex flex-col items-center py-10 gap-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h4 className="text-xl font-bold text-slate-900 dark:text-white">Saved!</h4>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-xs">
            Your grateful moment has been preserved. Come back tomorrow for a new prompt.
          </p>
          <Button onClick={onClose} className="min-h-[44px] bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90">
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <p className="text-lg font-semibold text-orange-800 dark:text-orange-300 text-center">
              ✨ {prompts[promptIndex]}
            </p>
          </div>
          <textarea
            value={entry}
            onChange={e => setEntry(e.target.value)}
            rows={5}
            placeholder="Write your thoughts here..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 text-base"
          />
          <Button
            onClick={handleSave}
            className="w-full min-h-[44px] bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
          >
            <Heart className="w-4 h-4 mr-2" />Save My Grateful Moment
          </Button>
        </div>
      )}
    </div>
  );
}

export default function YouthMirror() {
  const [activeFeature, setActiveFeature] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      id: 'selfie',
      title: 'Memory Selfie',
      description: 'Capture moments with AI-generated backgrounds from your favorite eras',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      action: () => setActiveFeature('selfie'),
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      action: () => navigate(createPageUrl('FamilyTimeline')),
    },
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: "Daily prompts to capture what you're grateful for",
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      action: () => setActiveFeature('moments'),
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      action: () => navigate(createPageUrl('Home')),
    },
    {
      id: 'collage',
      title: 'Memory Collages',
      description: 'Create beautiful photo collages of your favorite memories',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      action: () => navigate(createPageUrl('PhotoLibrary')),
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500',
      action: () => navigate(createPageUrl('MusicTherapy')),
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Write down thoughts, feelings, and memories',
      icon: BookOpen,
      color: 'from-amber-500 to-yellow-500',
      action: () => navigate(createPageUrl('CareJournalPage')),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Youth Mirror
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Capture your memories today, so you can treasure them tomorrow
          </p>
        </div>

        {/* Vision Statement */}
        <Card className="mb-8 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-2 border-violet-200 dark:border-violet-800">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-violet-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Building Memories for the Future
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Youth Mirror helps you actively document your life—your stories, photos, music, and moments—so 
              if you ever face memory challenges in the future, these treasured memories are preserved and 
              ready to bring you comfort and connection.
            </p>
          </CardContent>
        </Card>

        {/* Inline Feature Panels */}
        {activeFeature && (
          <Card className="mb-8 border-2 border-violet-300 dark:border-violet-700 shadow-xl">
            <CardContent className="p-6 md:p-8">
              {activeFeature === 'selfie' && <MemorySelfie onClose={() => setActiveFeature(null)} />}
              {activeFeature === 'moments' && <GratefulMoments onClose={() => setActiveFeature(null)} />}
            </CardContent>
          </Card>
        )}

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isActive = activeFeature === feature.id;
            return (
              <Card
                key={feature.id}
                className={`hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${isActive ? 'border-violet-400 dark:border-violet-600' : 'hover:border-violet-300 dark:hover:border-violet-700'}`}
                onClick={feature.action}
              >
                <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Future Vision */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Why This Matters
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Memory Mirror's creator built this after 25 years caring for family members with dementia. 
              Youth Mirror is the "prequel" - helping young people and adults actively preserve their 
              memories, relationships, and life stories while they can.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Your today becomes your tomorrow's comfort. Start building your memory bank now.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}