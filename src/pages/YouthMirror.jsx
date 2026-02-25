import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Plus, Trash2, Loader2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

const GRATITUDE_PROMPTS = [
  'What made you smile today?',
  'Who are you most grateful for right now?',
  'What simple pleasure did you enjoy today?',
  'What is something beautiful you noticed recently?',
  'What moment from this week do you want to remember forever?',
  'What are you looking forward to?',
  'What is something you love about your life right now?',
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
    onError: () => toast.error('Failed to save entry.'),
  });

  const handleSave = () => {
    if (!entry.trim()) { toast.error('Please write something first.'); return; }
    createMutation.mutate({
      title: title.trim() || `Memory — ${format(new Date(), 'PP')}`,
      notes: entry.trim(),
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 min-h-[44px]">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <BookOpen className="w-7 h-7 text-amber-500" /> Memory Journal
      </h2>
      <div className="space-y-3">
        <Input placeholder="Title (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} className="min-h-[44px]" />
        <Textarea placeholder="Write a memory..." value={entry} onChange={(e) => setEntry(e.target.value)} rows={4} />
        <Button onClick={handleSave} disabled={createMutation.isPending} className="w-full min-h-[44px]">
          {createMutation.isPending ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-3">
          {journals.map((j) => (
            <Card key={j.id}>
              <CardContent className="p-4">
                <p className="font-medium text-slate-800 dark:text-slate-100">{j.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{j.notes || j.content}</p>
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
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(GRATITUDE_PROMPTS[0]);

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['gratitude-moments'],
    queryFn: () => base44.entities.Memory.list('-created_date', 20).catch(() => []),
    select: (data) => data.filter(m => m.tags?.includes('gratitude')),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude-moments'] });
      setEntry('');
      setSelectedPrompt(GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]);
      toast.success('Grateful moment saved!');
    },
    onError: () => toast.error('Failed to save.'),
  });

  const handleSave = () => {
    if (!entry.trim()) { toast.error('Please write something first.'); return; }
    saveMutation.mutate({
      title: `Grateful: ${format(new Date(), 'MMM d, yyyy')}`,
      description: entry.trim(),
      era: 'present',
      emotional_tone: 'grateful',
      tags: ['gratitude', 'youth-mirror'],
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-4 min-h-[44px]">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Heart className="w-7 h-7 text-orange-500" /> Grateful Moments
      </h2>
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <p className="text-lg font-medium text-orange-800 dark:text-orange-200 mb-4 italic">"{selectedPrompt}"</p>
          <Textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write your grateful thought..." className="min-h-[120px] mb-4" />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600 min-h-[44px]">
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
              Save Moment
            </Button>
            <Button variant="outline" onClick={() => setSelectedPrompt(GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)])} className="min-h-[44px]">
              New Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
      {!isLoading && moments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Your Grateful Moments</h3>
          <div className="space-y-3">
            {moments.map(m => (
              <Card key={m.id} className="border-orange-100 dark:border-orange-900">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500 mb-1">{m.created_date ? format(new Date(m.created_date), 'MMM d, yyyy') : ''}</p>
                  <p className="text-slate-700 dark:text-slate-300">{m.description}</p>
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
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    { id: 'journal',  title: 'Memory Journal',       description: 'Write down thoughts, feelings, and memories',           icon: BookOpen,      color: 'from-amber-500 to-yellow-500' },
    { id: 'moments',  title: 'Grateful Moments',      description: "Daily prompts to capture what you're grateful for",     icon: Heart,         color: 'from-orange-500 to-red-500' },
    { id: 'chat',     title: 'AI Chat Buddy',          description: 'Talk about your day, memories, or anything on your mind', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { id: 'timeline', title: 'Life Timeline',          description: 'Build your personal history with photos and milestones', icon: Calendar,      color: 'from-purple-500 to-pink-500' },
    { id: 'music',    title: 'Music from Your Life',   description: 'Discover songs from important years',                  icon: Music,         color: 'from-indigo-500 to-purple-500' },
    { id: 'selfie',   title: 'Memory Selfie',          description: 'Capture moments with photos from your favourite times', icon: Camera,        color: 'from-blue-500 to-cyan-500' },
    { id: 'collage',  title: 'Memory Collages',        description: 'View your photo memories in a beautiful layout',       icon: Image,         color: 'from-pink-500 to-rose-500' },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.id === 'chat') {
      navigate(createPageUrl('Home'));
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-violet-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Youth Mirror</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Preserve your memories and life stories while you can — your today becomes your tomorrow's comfort.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                  <Button className={`w-full mt-4 bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}>
                    {feature.id === 'chat' ? 'Start Chat' : 'Explore'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Why This Matters
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Memory Mirror's creator built this after 25 years caring for family members with dementia.
              Youth Mirror is the "prequel" — helping young people and adults actively preserve their
              memories, relationships, and life stories while they can.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Your today becomes your tomorrow's comfort. Start building your memory bank now.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Youth Mirror — Preserving your memories for the future 💜
          </p>
        </div>
      </div>
    </div>
  );
}
