import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';

const GRATEFUL_PROMPTS = [
  "What made you smile today?",
  "Who are you grateful for right now?",
  "What is one thing you're looking forward to?",
  "Describe a moment that felt peaceful recently.",
  "What is something you appreciate about yourself?",
  "Share a happy memory that came to mind today.",
  "What small thing brought you joy this week?",
];

function MemoryJournalView({ onBack }) {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['youthJournals'],
    queryFn: () => base44.entities.CareJournal.list('-created_date', 30).catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareJournal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthJournals'] });
      setEntry('');
      setTitle('');
      toast.success('Journal entry saved!');
    },
    onError: () => toast.error('Failed to save entry. Please try again.'),
  });

  const handleSave = () => {
    if (!entry.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    createMutation.mutate({
      title: title.trim() || `Memory — ${format(new Date(), 'PP')}`,
      notes: entry.trim(),
    });
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-6 min-h-[44px]">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <BookOpen className="w-7 h-7 text-amber-500" /> Memory Journal
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Write down your thoughts, feelings, and memories to preserve them for the future.</p>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <Textarea
            placeholder="What's on your mind? Describe a memory, a feeling, or anything you want to remember…"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || !entry.trim()}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 min-h-[44px]"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
      ) : journals.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No journal entries yet. Write your first one above!</p>
      ) : (
        <div className="space-y-3">
          {journals.map((j, i) => (
            <Card key={j.id ?? i} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{j.title}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {j.created_date ? format(new Date(j.created_date), 'PP') : ''}
                  </span>
                </div>
                {j.notes && <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-line">{j.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function GratefulMomentsView({ onBack }) {
  const queryClient = useQueryClient();
  const [gratitude, setGratitude] = useState('');
  const today = new Date();
  const prompt = GRATEFUL_PROMPTS[today.getDay() % GRATEFUL_PROMPTS.length];

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['gratefulMoments'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 30)
      .then(logs => logs.filter(l => l.activity_type === 'grateful_moment'))
      .catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (text) => base44.entities.ActivityLog.create({
      activity_type: 'grateful_moment',
      details: { text, prompt },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratefulMoments'] });
      setGratitude('');
      toast.success('Grateful moment saved! 💛');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  const handleSave = () => {
    if (!gratitude.trim()) {
      toast.error('Please write something first.');
      return;
    }
    createMutation.mutate(gratitude.trim());
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-violet-600 hover:text-violet-700 mb-6 min-h-[44px]">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
        <Heart className="w-7 h-7 text-orange-500" /> Grateful Moments
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Capture what you're grateful for each day to build a collection of positive memories.</p>

      <Card className="mb-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
        <CardContent className="p-4 space-y-3">
          <p className="text-orange-700 dark:text-orange-400 font-medium italic">"{prompt}"</p>
          <Textarea
            placeholder="Write your answer here…"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            rows={4}
            className="resize-none bg-white dark:bg-slate-800"
          />
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending || !gratitude.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px]"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
            Save Moment
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
      ) : entries.length === 0 ? (
        <p className="text-center text-slate-400 py-8">No grateful moments yet. Record your first one above!</p>
      ) : (
        <div className="space-y-3">
          {entries.map((e, i) => (
            <Card key={e.id ?? i} className="border border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs text-orange-600 dark:text-orange-400 italic">{e.details?.prompt}</p>
                  <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
                    {e.created_date ? format(new Date(e.created_date), 'PP') : ''}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{e.details?.text}</p>
              </CardContent>
            </Card>
          ))}
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
      comingSoon: true,
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      comingSoon: true,
    },
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: 'Daily prompts to capture what you\'re grateful for',
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      comingSoon: false,
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      comingSoon: false,
    },
    {
      id: 'collage',
      title: 'Memory Collages',
      description: 'Create beautiful photo collages of your favorite memories',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      comingSoon: true,
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500',
      comingSoon: true,
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Write down thoughts, feelings, and memories',
      icon: BookOpen,
      color: 'from-amber-500 to-yellow-500',
      comingSoon: false,
    }
  ];

  const handleFeatureClick = (feature) => {
    if (feature.id === 'chat') {
      navigate(createPageUrl('Home'));
      return;
    }
    if (feature.comingSoon) {
      toast.info(`${feature.title} — coming soon!`);
      return;
    }
    setActiveFeature(feature.id);
  };

  if (activeFeature === 'journal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <MemoryJournalView onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  if (activeFeature === 'moments') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <GratefulMomentsView onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-violet-300 dark:hover:border-violet-700"
                onClick={() => handleFeatureClick(feature)}
              >
                <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      {feature.comingSoon && (
                        <span className="text-xs text-slate-400 font-normal">Coming soon</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button
                    className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}
                  >
                    {feature.comingSoon ? 'Coming Soon' : feature.id === 'chat' ? 'Start Chat' : 'Explore'}
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