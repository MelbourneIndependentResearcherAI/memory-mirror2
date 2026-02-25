import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, X, Trash2, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Plus, Trash2, Loader2, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns
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

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Title (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <textarea
              placeholder="Write about a memory, a moment, or something you're feeling today..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              rows={4}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

const GRATEFUL_PROMPTS = [
  "What made you smile today?",
  "Who are you grateful for right now?",
  "What is one thing you're looking forward to?",
  "Describe a moment that felt peaceful recently.",
  "What is something you appreciate about yourself?",
  "Share a happy memory that came to mind today.",
  "What small thing brought you joy this week?",
];


// ── Grateful Moments Panel ─────────────────────────────────────────────────────
const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Name someone who made a positive difference in your life.",
  "What's a simple pleasure you enjoy?",
  "Describe a place that brings you peace.",
  "What skill or talent are you grateful to have?",
  "Who is someone you love and why?",
  "What memory from childhood brings you joy?",
  "What's something beautiful you noticed recently?",
];

function GratefulMomentsPanel() {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]);

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['gratitude-moments'],
    queryFn: () => base44.entities.Memory.list('-created_date', 20),
    select: (data) => data.filter(m => m.tags?.includes('gratitude')),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitude-moments'] });
      setEntry('');
      setSelectedPrompt(GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]);
      toast.success('Grateful moment saved! 🌟');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
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
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6">
          <p className="text-lg font-medium text-orange-800 dark:text-orange-200 mb-4 italic">"{selectedPrompt}"</p>
          <Textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Write your grateful thought here..."
            className="min-h-[120px] mb-4"
          />
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

      {isLoading ? <p className="text-center text-slate-500">Loading your moments...</p> : moments.length > 0 && (
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

// ── Memory Journal Panel ───────────────────────────────────────────────────────
function MemoryJournalPanel() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => base44.entities.Memory.list('-created_date', 30),
    select: (data) => data.filter(m => m.tags?.includes('youth-journal')),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setTitle('');
      setContent('');
      toast.success('Journal entry saved! 📖');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Memory.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal-entries'] }),
  });

  const handleSave = () => {
    if (!content.trim()) { toast.error('Please write something first.'); return; }
    saveMutation.mutate({
      title: title.trim() || `Journal — ${format(new Date(), 'MMM d, yyyy')}`,
      description: content.trim(),
      era: 'present',
      emotional_tone: 'reflective',
      tags: ['youth-journal', 'youth-mirror'],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title (optional)"
            className="mb-3"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts, memories, and feelings..."
            className="min-h-[160px] mb-4"
          />
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-amber-500 hover:bg-amber-600 min-h-[44px]">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <p className="text-center text-slate-500">Loading your journal...</p> : entries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Previous Entries</h3>
          <div className="space-y-3">
            {entries.map(entry => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{entry.title}</h4>
                      <p className="text-xs text-slate-500 mb-2">{entry.created_date ? format(new Date(entry.created_date), 'MMM d, yyyy') : ''}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3">{entry.description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(entry.id)} className="text-slate-400 hover:text-red-500 ml-2 min-h-[36px] min-w-[36px]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Life Timeline Panel ────────────────────────────────────────────────────────
const TIMELINE_CATEGORIES = ['birth', 'wedding', 'graduation', 'career', 'travel', 'family', 'friendship', 'achievement', 'other'];
const CATEGORY_ICONS = { birth: '👶', wedding: '💒', graduation: '🎓', career: '💼', travel: '✈️', family: '👨‍👩‍👧', friendship: '🤝', achievement: '🏆', other: '⭐' };

function LifeTimelinePanel() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ event_title: '', event_date: '', description: '', category: 'other' });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['youth-timeline'],
    queryFn: () => base44.entities.MemoryTimeline.list('event_date'),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.MemoryTimeline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youth-timeline'] });
      setShowForm(false);
      setFormData({ event_title: '', event_date: '', description: '', category: 'other' });
      toast.success('Life event added! 🎉');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MemoryTimeline.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['youth-timeline'] }),
  });

  const handleSubmit = () => {
    if (!formData.event_title || !formData.event_date) { toast.error('Please fill in title and date.'); return; }
    addMutation.mutate({ ...formData, added_by_name: 'You' });
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="bg-purple-500 hover:bg-purple-600 min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" /> Add Life Event
        </Button>
      ) : (
        <Card className="border-purple-200 dark:border-purple-800">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Event title (e.g., Graduated from University)" value={formData.event_title} onChange={(e) => setFormData({ ...formData, event_title: e.target.value })} />
            <Input type="date" value={formData.event_date} onChange={(e) => setFormData({ ...formData, event_date: e.target.value })} />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {TIMELINE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <Textarea placeholder="Tell the story of this moment..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[100px]" />
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={addMutation.isPending} className="bg-purple-500 hover:bg-purple-600 min-h-[44px]">
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Save Event
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="min-h-[44px]">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p className="text-center text-slate-500">Loading timeline...</p> : events.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No life events yet. Add your first one!</p>
      ) : (
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-purple-200 dark:bg-purple-800" />
          {[...events].reverse().map(event => (
            <div key={event.id} className="relative mb-6">
              <div className="absolute -left-5 top-1 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-lg border-2 border-purple-300 dark:border-purple-700">
                {CATEGORY_ICONS[event.category] || '⭐'}
              </div>
              <Card className="ml-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">{event.event_title}</h4>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">{event.event_date ? format(new Date(event.event_date), 'MMMM d, yyyy') : ''}</p>
                      {event.description && <p className="text-sm text-slate-600 dark:text-slate-400">{event.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(event.id)} className="text-slate-400 hover:text-red-500 ml-2 min-h-[36px] min-w-[36px]">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
    </div>
  );
}

function AIChatBuddyPanel() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Chat Buddy. I'm here to listen, chat about your day, help you reflect on memories, or just keep you company. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('chatWithAI', {
        message: text,
        conversationHistory: newMessages.slice(1).slice(-10),
        detectedEra: 'present',
      });
      const reply = response?.data?.response || response?.response || "I'm here with you. Tell me more!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here with you. Sometimes connections can be tricky — please try again!" }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1" />
        <Button onClick={sendMessage} disabled={isLoading || !input.trim()} className="bg-green-500 hover:bg-green-600 min-h-[44px] min-w-[44px]">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Music from Your Life Panel ─────────────────────────────────────────────────
function MusicFromYourLifePanel() {
  const [decade, setDecade] = useState('1980s');
  const [genre, setGenre] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

  const handleSearch = async () => {
    setIsLoading(true);
    setResults([]);
    try {
      const response = await base44.functions.invoke('suggestMusic', {
        era: decade,
        mood: 'nostalgic',
        genre: genre || undefined,
      });
      const suggestions = response?.data?.suggestions || response?.suggestions || [];
      setResults(suggestions);
      if (suggestions.length === 0) toast.info('No results found. Try a different decade or genre.');
    } catch {
      toast.error('Could not load music suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            {DECADES.map(d => (
              <button
                key={d}
                onClick={() => setDecade(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[36px] ${decade === d ? 'bg-indigo-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}
              >
                {d}
              </button>
            ))}
          </div>
          <Input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genre (optional, e.g. rock, jazz, pop)"
            className="mb-4"
          />
          <Button onClick={handleSearch} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Music className="w-4 h-4 mr-2" />}
            Find Music from the {decade}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Songs from the {decade}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.map((song, i) => (
              <Card key={i} className="border-indigo-100 dark:border-indigo-900">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0">🎵</div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{song.title || song.song || song.name}</p>
                    <p className="text-sm text-slate-500 truncate">{song.artist}</p>
                    {song.year && <Badge variant="outline" className="text-xs mt-1">{song.year}</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Memory Selfie Panel ────────────────────────────────────────────────────────
function MemorySelfiePanel() {
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: selfies = [], isLoading } = useQuery({
    queryKey: ['memory-selfies'],
    queryFn: () => base44.entities.Memory.list('-created_date', 20),
    select: (data) => data.filter(m => m.tags?.includes('youth-selfie')),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) { toast.error('Please select a photo first.'); return; }
    setIsUploading(true);
    try {
      let imageUrl = '';
      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });
        imageUrl = uploadResult.file_url || '';
      } catch {
        imageUrl = previewUrl || '';
      }
      await base44.entities.Memory.create({
        title: caption.trim() || `Memory Selfie — ${format(new Date(), 'MMM d, yyyy')}`,
        description: caption.trim() || 'A captured moment.',
        image_url: imageUrl,
        era: 'present',
        emotional_tone: 'joyful',
        tags: ['youth-selfie', 'youth-mirror'],
      });
      queryClient.invalidateQueries({ queryKey: ['memory-selfies'] });
      setCaption('');
      setPreviewUrl(null);
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Memory selfie saved! 📸');
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsUploading(false);
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
              className="bg-amber-500 hover:bg-amber-600 text-white min-h-[44px]"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Entry
            </Button>
          </div>

          {/* Past Entries */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : journalEntries.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 py-4">No journal entries yet. Write your first one above!</p>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Past Entries</h3>
              {journalEntries.map((je) => (
                <div key={je.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{je.title || 'Journal Entry'}</span>
                    <button
                      onClick={() => deleteMutation.mutate(je.id)}
                      className="text-slate-400 hover:text-red-500 flex-shrink-0 min-h-[28px] min-w-[28px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{je.content}</p>
                  {je.created_date && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                      {format(new Date(je.created_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

// Grateful Moments mini-component
function GratefulMoments({ onClose }) {
  const [gratitudeText, setGratitudeText] = useState('');
  const queryClient = useQueryClient();

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['gratitudeLogs'],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.list('-created_date', 30);
      return logs.filter(l => l.activity_type === 'gratitude_entry');
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
    mutationFn: (data) => base44.entities.ActivityLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratitudeLogs'] });
      setGratitudeText('');
      toast.success('Gratitude moment saved! 💛');
    mutationFn: (data) => base44.entities.Memory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthGratefulMoments'] });
      setEntry('');
      toast.success('Grateful moment saved! 💚');
    },
    onError: () => toast.error('Failed to save'),
  });

  const prompts = [
    'Something that made me smile today...',
    'A person I\'m grateful for...',
    'A memory I treasure...',
    'Something beautiful I noticed...',
    'A small joy from today...',
  ];

  const todayPrompt = prompts[new Date().getDay() % prompts.length];

  const handleSave = () => {
    if (!gratitudeText.trim()) {
      toast.error('Please share something you\'re grateful for');
      return;
    }
    createMutation.mutate({
      activity_type: 'gratitude_entry',
      details: { text: gratitudeText.trim(), prompt: todayPrompt },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Grateful Moments</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Today's Prompt */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl p-5 mb-5 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-1">Today's Prompt:</p>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 italic">{todayPrompt}</p>
          </div>

          <div className="space-y-3 mb-5">
            <textarea
              placeholder="Share something you're grateful for..."
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white min-h-[44px]"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
              Save Grateful Moment
            </Button>
          </div>

          {/* Past Entries */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            </div>
          ) : activityLogs.length === 0 ? (
            <p className="text-center text-slate-400 dark:text-slate-500 text-sm py-4">Start capturing grateful moments above!</p>
          ) : (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Recent Moments</h3>
              {activityLogs.slice(0, 10).map((log, idx) => (
                <div key={log.id || idx} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg p-3">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{log.details?.text}</p>
                  {log.created_date && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {format(new Date(log.created_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import YouthMirrorCamera from '@/components/memory-mirror/YouthMirror';

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
  const [_activeFeature, setActiveFeature] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
import { createPageUrl } from '@/utils';
import MemorySelfie from '@/components/memory-mirror/YouthMirror';

/* ─────────────────────────────────────────────
   Grateful Moments Feature
───────────────────────────────────────────── */
function GratefulMoments({ onBack }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const prompts = [
    'What made you smile today?',
    'Name one person you appreciate and why.',
    'What is a memory that brings you joy?',
    'What is something beautiful you noticed recently?',
    'What skill or strength are you proud of?',
  ];
  const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);

  const { data: entries = [] } = useQuery({
    queryKey: ['gratefulMoments'],
    queryFn: () => base44.entities.CareJournal.list('-created_date', 20).catch(() => []),
  });

  const gratefulEntries = entries.filter(e => e.tags?.includes('grateful') || e.title?.startsWith('Grateful:'));

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.CareJournal.create({
      title: `Grateful: ${text.substring(0, 60)}`,
      content: text,
      entry_type: 'text',
      tags: ['grateful', 'youth-mirror'],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratefulMoments'] });
      setText('');
      toast.success('Grateful moment saved! 💛');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-orange-500" /> Grateful Moments
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Daily prompts to capture what you're grateful for</p>
      </div>

      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
        <CardContent className="p-6">
          <p className="text-lg font-medium text-orange-900 dark:text-orange-200 mb-4 italic">"{prompt}"</p>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts here..."
            className="mb-4 min-h-[100px]"
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!text.trim() || saveMutation.isPending}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px] w-full"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Grateful Moment 💛'}
          </Button>
        </CardContent>
      </Card>

      {gratefulEntries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Past Moments</h3>
          <div className="space-y-3">
            {gratefulEntries.slice(0, 8).map((entry) => (
              <Card key={entry.id} className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <p className="text-slate-700 dark:text-slate-300">{entry.content}</p>
                  {entry.created_date && (
                    <p className="text-xs text-slate-400 mt-2">
                      {format(parseISO(entry.created_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Memory Journal Feature
───────────────────────────────────────────── */
function MemoryJournal({ onBack }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: entries = [] } = useQuery({
    queryKey: ['youthJournal'],
    queryFn: () => base44.entities.CareJournal.list('-created_date', 30).catch(() => []),
  });

  const journalEntries = entries.filter(e => e.tags?.includes('youth-journal'));

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.CareJournal.create({
      title: title || `Journal – ${format(new Date(), 'MMM d, yyyy')}`,
      content,
      entry_type: 'text',
      tags: ['youth-journal', 'youth-mirror'],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthJournal'] });
      setTitle('');
      setContent('');
      toast.success('Journal entry saved! 📖');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" /> Memory Journal
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Write down thoughts, feelings, and memories</p>
      </div>

      {selected ? (
        <Card>
          <CardContent className="p-6">
            <Button variant="ghost" onClick={() => setSelected(null)} className="mb-4 gap-2 min-h-[44px]">
              <ArrowLeft className="w-4 h-4" /> Back to list
            </Button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selected.title}</h3>
            {selected.created_date && (
              <p className="text-sm text-slate-400 mb-4">{format(parseISO(selected.created_date), 'EEEE, MMMM d, yyyy')}</p>
            )}
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selected.content}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6 space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title (optional)..."
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts, memories, feelings..."
                className="min-h-[150px]"
              />
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!content.trim() || saveMutation.isPending}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 min-h-[44px] w-full"
              >
                {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Entry 📖'}
              </Button>
            </CardContent>
          </Card>

          {journalEntries.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Previous Entries</h3>
              <div className="space-y-2">
                {journalEntries.map((entry) => (
                  <button
                    key={entry.id}
                    className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-colors min-h-[44px]"
                    onClick={() => setSelected(entry)}
                  >
                    <p className="font-medium text-slate-800 dark:text-slate-200">{entry.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{entry.content}</p>
                    {entry.created_date && (
                      <p className="text-xs text-slate-400 mt-1">{format(parseISO(entry.created_date), 'MMM d, yyyy')}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AI Chat Buddy Feature
───────────────────────────────────────────── */
function AIChatBuddy({ onBack }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI chat buddy 😊 Tell me about your day, share a memory, or ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);
    try {
      const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a warm, friendly AI chat buddy for a youth memory preservation app. Be encouraging, curious, and supportive. Help the user reflect on and document their memories and experiences.\n\nConversation:\n${history}\nUser: ${userText}\nAssistant:`,
      });
      const reply = typeof response === 'string' ? response : response?.content || response?.text || "I'm here to chat! Tell me more.";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a little trouble right now. Try again in a moment!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Voice input not supported in this browser.'); return; }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      sendMessage(transcript);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
    setIsListening(true);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-green-500" /> AI Chat Buddy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Talk about your day, memories, or anything on your mind</p>
      </div>

      <Card className="h-96 overflow-y-auto">
        <CardContent className="p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          onClick={toggleVoice}
          variant="outline"
          className={`min-h-[44px] ${isListening ? 'bg-red-50 border-red-300' : ''}`}
        >
          {isListening ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
        </Button>
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          className="bg-green-500 hover:bg-green-600 min-h-[44px]"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Music from Your Life Feature
───────────────────────────────────────────── */
function MusicFromYourLife({ onBack }) {
  const [year, setYear] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = async () => {
    if (!year || isNaN(parseInt(year))) { toast.error('Please enter a valid year.'); return; }
    setIsLoading(true);
    try {
      const result = await base44.functions.invoke('suggestMusic', {
        era: year,
        mood: 'nostalgic',
        preferences: [],
      });
      setSuggestions(result?.data);
    } catch {
      // Fallback: use LLM
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `List 8 popular and meaningful songs from ${year}. Format as JSON array with objects having "title", "artist", and "why_memorable" fields. Return only valid JSON.`,
          response_json_schema: {
            type: 'object',
            properties: {
              songs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    artist: { type: 'string' },
                    why_memorable: { type: 'string' },
                  }
                }
              }
            }
          }
        });
        const parsed = typeof response === 'string' ? JSON.parse(response) : response;
        setSuggestions({ songs: parsed?.songs || [] });
      } catch {
        toast.error('Could not retrieve music suggestions. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Music className="w-6 h-6 text-indigo-500" /> Music from Your Life
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Discover songs from important years in your life</p>
      </div>

      <Card className="border-2 border-indigo-200 dark:border-indigo-800">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-3">
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter a year (e.g. 1985)"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              className="flex-1"
            />
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="bg-amber-500 hover:bg-amber-600 text-white min-h-[44px]"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Entry
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            </div>
          ) : journalEntries.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No entries yet. Write your first memory!</p>
          ) : (
            <div className="space-y-3">
              {journalEntries.map((je) => (
                <div key={je.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{je.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{je.content}</p>
                      {je.created_date && (
                        <p className="text-xs text-slate-400 mt-1">{format(new Date(je.created_date), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(je.id)}
                      className="text-red-400 hover:text-red-600 min-w-[36px] min-h-[36px] flex items-center justify-center flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Grateful Moments mini-component
function GratefulMoments({ onClose }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const prompts = [
    'What made you smile today?',
    'Name one person you appreciate and why.',
    'What is a memory that brings you joy?',
    'What is something beautiful you noticed recently?',
    'What skill or strength are you proud of?',
  ];
  const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)]);

  const { data: entries = [] } = useQuery({
    queryKey: ['gratefulMoments'],
    queryFn: () => base44.entities.CareJournal.list('-created_date', 20).catch(() => []),
  });

  const gratefulEntries = entries.filter(e => e.entry_type === 'grateful_moment');

  const saveMutation = useMutation({
    mutationFn: () => base44.entities.CareJournal.create({
      title: `Grateful: ${text.substring(0, 60)}`,
      content: text,
      entry_type: 'grateful_moment',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gratefulMoments'] });
      setText('');
      toast.success('Grateful moment saved! 💛');
    },
    onError: () => toast.error('Failed to save. Please try again.'),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Grateful Moments</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-orange-600 dark:text-orange-400 italic mb-4">"{prompt}"</p>
          <textarea
            placeholder="Write your answer here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none mb-4"
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !text.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px]"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Moment
          </Button>

          {gratefulEntries.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Past moments</h3>
              {gratefulEntries.slice(0, 5).map((e) => (
                <div key={e.id} className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                  {e.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function YouthMirror() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState(null);

  const features = [
    { id: 'selfie',   title: 'Memory Selfie',       description: 'Capture moments with photos from your favourite times', icon: Camera,        color: 'from-blue-500 to-cyan-500' },
    { id: 'timeline', title: 'Life Timeline',        description: 'Build your personal history with photos, stories, and milestones', icon: Calendar,      color: 'from-purple-500 to-pink-500' },
    { id: 'moments',  title: 'Grateful Moments',     description: "Daily prompts to capture what you're grateful for",    icon: Heart,         color: 'from-orange-500 to-red-500' },
    { id: 'chat',     title: 'AI Chat Buddy',        description: 'Talk about your day, memories, or anything on your mind', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { id: 'collage',  title: 'Memory Collages',      description: 'View your photo memories in a beautiful collage layout', icon: Image,         color: 'from-pink-500 to-rose-500' },
    { id: 'music',    title: 'Music from Your Life', description: 'Discover songs from important years and create playlists', icon: Music,         color: 'from-indigo-500 to-purple-500' },
    { id: 'journal',  title: 'Memory Journal',       description: 'Write down thoughts, feelings, and memories',          icon: BookOpen,      color: 'from-amber-500 to-yellow-500' },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.id === 'chat') {
      navigate(createPageUrl('Home'));
      return;
    }
    if (feature.id === 'journal' || feature.id === 'moments') {
      setActiveModal(feature.id);
      return;
    }
    toast.info(`${feature.title} — coming soon!`);
const JOURNAL_KEY = 'youth_mirror_journal';
const MOMENTS_KEY = 'youth_mirror_moments';

const GRATITUDE_PROMPTS = [
  "What made you smile today?",
  "Name three people you're grateful for and why.",
  "What's a simple pleasure you enjoyed recently?",
  "What challenge helped you grow this week?",
  "Describe a happy memory from your past.",
  "What talent or ability are you thankful to have?",
  "Who showed you kindness recently?",
  "What's something beautiful you noticed today?",
  "What opportunity are you looking forward to?",
  "What's a lesson life has taught you that you're grateful for?",
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createPageUrl } from '../utils';

const features = [
  {
    id: 'journal',
    title: 'Memory Journal',
    description: 'Write down thoughts, feelings, and memories to preserve them for the future.',
    icon: BookOpen,
    color: 'from-amber-500 to-yellow-500',
    page: 'FamilyStories',
  },
  {
    id: 'moments',
    title: 'Grateful Moments',
    description: "Daily prompts to capture what you're grateful for and cherish.",
    icon: Heart,
    color: 'from-orange-500 to-red-500',
    page: 'SharedJournal',
  },
  {
    id: 'timeline',
    title: 'Life Timeline',
    description: 'Build your personal history with photos, stories, and milestones.',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    page: 'FamilyTimeline',
  },
  {
    id: 'chat',
    title: 'AI Chat Buddy',
    description: 'Talk about your day, memories, or anything on your mind.',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-500',
    page: 'ChatMode',
  },
  {
    id: 'collage',
    title: 'Memory Collages',
    description: 'View your photo memories in a beautiful collage layout.',
    icon: Image,
    color: 'from-pink-500 to-rose-500',
    page: 'FamilyMediaAlbum',
  },
  {
    id: 'music',
    title: 'Music from Your Life',
    description: 'Discover songs from important years and create playlists.',
    icon: Music,
    color: 'from-indigo-500 to-purple-500',
    page: 'FamilyMusic',
  },
  {
    id: 'photos',
    title: 'Photo Library',
    description: 'Upload and organise your cherished memory photos.',
    icon: Camera,
    color: 'from-blue-500 to-cyan-500',
    page: 'FamilyPhotoAlbum',
  },
];

export default function YouthMirror() {
  const navigate = useNavigate();

  const handleFeatureClick = (page) => {
    navigate(createPageUrl(page));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 mb-6 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
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

        {/* Vision Card */}
        <Card className="mb-8 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-950/30 dark:to-fuchsia-950/30 border-2 border-violet-200 dark:border-violet-800">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-violet-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Building Memories for the Future
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Youth Mirror helps you actively document your life — your stories, photos, music, and moments —
              so these treasured memories are preserved and ready to bring you comfort and connection.
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
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                onClick={() => handleFeatureClick(feature)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                className="hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-violet-300 dark:hover:border-violet-700"
                onClick={() => handleFeatureClick(feature.page)}
              >
                <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                  <Button className={`w-full mt-4 bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}>
                    {feature.id === 'chat' ? 'Start Chat' : 'Explore'}
                  <Button
                    className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}
                    onClick={(e) => { e.stopPropagation(); handleFeatureClick(feature.page); }}
                  >
                    Explore
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
        {/* Why This Matters */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Heart className="w-7 h-7 text-red-500" />
              Why This Matters
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Memory Mirror's creator built this after 25 years caring for family members with dementia.
              Youth Mirror is the "prequel" - helping young people and adults actively preserve their
              Youth Mirror is the "prequel" — helping young people and adults actively preserve their
              Memory Mirror was built after years of caring for family members with dementia.
              Youth Mirror is the &ldquo;prequel&rdquo; — helping young people and adults actively preserve their
              memories, relationships, and life stories while they can.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Your today becomes your tomorrow&rsquo;s comfort. Start building your memory bank now.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
