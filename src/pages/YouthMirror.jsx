import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

function GratefulMomentsPanel({ onClose }) {
  const [entry, setEntry] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!entry.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    setSaved(true);
    toast.success('Grateful moment saved! 💛');
    setTimeout(onClose, 1500);
  };

  return (
    <Card className="mb-8 border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-orange-500" />
            Grateful Moments
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>✕ Close</Button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-4 italic">
          What are you grateful for today?
        </p>
        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write about a person, place, or moment you're thankful for…"
          className="min-h-[100px] mb-4"
          disabled={saved}
        />
        <Button
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px]"
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✓ Saved' : '💛 Save Moment'}
        </Button>
      </CardContent>
    </Card>
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
      description: 'Daily prompts to capture what you\'re grateful for',
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
    }
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

        {/* Feature Grid */}
        {activeFeature === 'selfie' && (
          <Card className="mb-8 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  Memory Selfie
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveFeature(null)}>✕ Close</Button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Use your device camera to capture a moment. Your photos are saved to your Memory Photo Library.
              </p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 min-h-[44px]"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.onchange = () => {
                    if (input.files && input.files[0]) {
                      navigate(createPageUrl('PhotoLibrary'));
                    }
                  };
                  input.click();
                }}
              >
                <Camera className="w-4 h-4 mr-2" /> Open Camera
              </Button>
            </CardContent>
          </Card>
        )}

        {activeFeature === 'moments' && (
          <GratefulMomentsPanel onClose={() => setActiveFeature(null)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-violet-300 dark:hover:border-violet-700"
                onClick={() => feature.action()}
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

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Youth Mirror features are currently in development. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
}