import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';

const GRATEFUL_PROMPTS = [
  'What made you smile today?',
  'Who are you most grateful for right now?',
  'What simple pleasure did you enjoy today?',
  'What is something beautiful you noticed recently?',
  'What moment from this week do you want to remember forever?',
  'What are you looking forward to?',
  'What is something you love about your life right now?',
];

function MemoryJournal({ onBack }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['youthJournalMemories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthJournalMemories'] });
      setTitle('');
      setDescription('');
      setShowForm(false);
      toast.success('Memory saved!');
    },
    onError: () => toast.error('Failed to save memory'),
  });

  const handleSave = () => {
    if (!title.trim()) { toast.error('Please add a title'); return; }
    if (!description.trim()) { toast.error('Please write something'); return; }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      era: 'present',
      emotional_tone: 'joyful',
      tags: ['youth-mirror', 'journal'],
    });
  };

  const formatDate = (raw) => {
    try {
      const d = raw ? parseISO(raw) : null;
      return d && isValid(d) ? format(d, 'MMM d, yyyy') : '';
    } catch { return ''; }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-violet-600 hover:text-violet-700 min-h-[44px]">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 gap-2 min-h-[44px]"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <BookOpen className="w-6 h-6 text-amber-500" /> Memory Journal
      </h2>

      {showForm && (
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardContent className="p-6 space-y-4">
            <Input
              placeholder="Give this memory a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium"
              maxLength={120}
            />
            <Textarea
              placeholder="Write your memory or thoughts here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 min-h-[44px]"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Memory'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && <p className="text-slate-500 text-center py-8">Loading memories...</p>}

      {!isLoading && memories.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No journal entries yet</p>
            <p className="text-sm text-slate-400 mt-2">Tap "New Entry" to write your first memory</p>
          </CardContent>
        </Card>
      )}

      {memories.map((memory) => (
        <Card key={memory.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">{memory.title}</h3>
              {memory.created_date && (
                <span className="text-xs text-slate-400 shrink-0">{formatDate(memory.created_date)}</span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
              {memory.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GratefulMoments({ onBack }) {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState('');
  const prompt = GRATEFUL_PROMPTS[new Date().getDay() % GRATEFUL_PROMPTS.length];

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['youthGratefulMoments'],
    queryFn: async () => {
      const all = await base44.entities.Memory.list('-created_date', 50);
      return all.filter(m => Array.isArray(m.tags) && m.tags.includes('grateful-moment'));
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthGratefulMoments'] });
      setEntry('');
      toast.success('Grateful moment saved! 💚');
    },
    onError: () => toast.error('Failed to save'),
  });

  const handleSave = () => {
    if (!entry.trim()) { toast.error('Please write something'); return; }
    createMutation.mutate({
      title: `Grateful: ${new Date().toLocaleDateString()}`,
      description: entry.trim(),
      era: 'present',
      emotional_tone: 'grateful',
      tags: ['youth-mirror', 'grateful-moment'],
    });
  };

  const formatDate = (raw) => {
    try {
      const d = raw ? parseISO(raw) : null;
      return d && isValid(d) ? format(d, 'MMM d, yyyy') : '';
    } catch { return ''; }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-violet-600 hover:text-violet-700 min-h-[44px]">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Heart className="w-6 h-6 text-orange-500" /> Grateful Moments
      </h2>

      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="p-6 space-y-4">
          <p className="text-orange-700 dark:text-orange-300 font-medium text-lg">{prompt}</p>
          <Textarea
            placeholder="Write what you're grateful for..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            rows={4}
            maxLength={1000}
          />
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px]"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Grateful Moment 💚'}
          </Button>
        </CardContent>
      </Card>

      {isLoading && <p className="text-slate-500 text-center py-4">Loading moments...</p>}

      {!isLoading && moments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Your Grateful Moments</h3>
          <div className="space-y-3">
            {moments.map((m) => (
              <Card key={m.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-orange-500">💚</span>
                    {m.created_date && (
                      <span className="text-xs text-slate-400">{formatDate(m.created_date)}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function YouthMirror() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 'selfie',
      title: 'Memory Selfie',
      description: 'Capture moments with AI-generated backgrounds from your favorite eras',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      available: false,
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      available: false,
    },
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: 'Daily prompts to capture what you\'re grateful for',
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      available: true,
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      available: false,
    },
    {
      id: 'collage',
      title: 'Memory Collages',
      description: 'Create beautiful photo collages of your favorite memories',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      available: false,
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500',
      available: false,
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Write down thoughts, feelings, and memories',
      icon: BookOpen,
      color: 'from-amber-500 to-yellow-500',
      available: true,
    }
  ];

  if (activeFeature === 'journal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <MemoryJournal onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  if (activeFeature === 'moments') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <GratefulMoments onBack={() => setActiveFeature(null)} />
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
                onClick={() => {
                  if (feature.available) {
                    setActiveFeature(feature.id);
                  } else {
                    toast.info(`${feature.title} coming soon!`);
                  }
                }}
              >
                <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      {!feature.available && (
                        <span className="text-xs text-slate-400">Coming soon</span>
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
                    {feature.available ? 'Open' : 'Explore'}
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