import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, X, Save, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

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
];

function MemoryJournal({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]');
      setEntries(saved);
    } catch {
      setEntries([]);
    }
  }, []);

  const saveEntry = () => {
    if (!content.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    const entry = {
      id: Date.now(),
      title: title.trim() || 'Untitled Entry',
      content: content.trim(),
      date: new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    setTitle('');
    setContent('');
    toast.success('Journal entry saved!');
  };

  const deleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
    toast.success('Entry deleted.');
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          Memory Journal
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="min-h-[44px] min-w-[44px]">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4 space-y-3">
          <Input
            placeholder="Entry title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-base"
          />
          <Textarea
            placeholder="Write your thoughts, feelings, or memories here…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="text-base resize-none"
          />
          <Button
            onClick={saveEntry}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 min-h-[44px]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">
            Previous Entries ({entries.length})
          </h4>
          {entries.map((entry) => (
            <Card key={entry.id} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    className="flex-1 text-left min-h-[44px] flex items-start gap-2"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{entry.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{entry.date}</p>
                    </div>
                    {expandedId === entry.id
                      ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntry(entry.id)}
                    className="min-h-[44px] min-w-[44px] text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {expandedId === entry.id && (
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap border-t border-slate-100 dark:border-slate-700 pt-2">
                    {entry.content}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
          No entries yet. Write your first memory above!
        </p>
      )}
    </div>
  );
}

function GratefulMoments({ onClose }) {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  const [prompt] = useState(() => GRATITUDE_PROMPTS[new Date().getDay() % GRATITUDE_PROMPTS.length]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(MOMENTS_KEY) || '[]');
      setEntries(saved);
    } catch {
      setEntries([]);
    }
  }, []);

  const saveEntry = () => {
    if (!content.trim()) {
      toast.error('Please write something before saving.');
      return;
    }
    const entry = {
      id: Date.now(),
      prompt,
      content: content.trim(),
      date: new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
    setContent('');
    toast.success('Grateful moment saved! 🌟');
  };

  const deleteEntry = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-orange-500" />
          Grateful Moments
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="min-h-[44px] min-w-[44px]">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Card className="border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
        <CardContent className="p-4 space-y-3">
          <p className="text-base font-semibold text-orange-700 dark:text-orange-300 italic">
            "{prompt}"
          </p>
          <Textarea
            placeholder="Share what you're grateful for…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="text-base resize-none"
          />
          <Button
            onClick={saveEntry}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 min-h-[44px]"
          >
            <Heart className="w-4 h-4 mr-2" />
            Save Moment
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">
            Your Gratitude ({entries.length})
          </h4>
          {entries.map((entry) => (
            <Card key={entry.id} className="border border-slate-200 dark:border-slate-700">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-1">"{entry.prompt}"</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{entry.content}</p>
                    <p className="text-xs text-slate-400 mt-1">{entry.date}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEntry(entry.id)}
                    className="min-h-[44px] min-w-[44px] text-red-400 hover:text-red-600 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">
          No moments saved yet. Capture your first grateful moment above!
        </p>
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
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: 'Daily prompts to capture what you\'re grateful for',
      icon: Heart,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'collage',
      title: 'Memory Collages',
      description: 'Create beautiful photo collages of your favorite memories',
      icon: Image,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Write down thoughts, feelings, and memories',
      icon: BookOpen,
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  const handleFeatureClick = (id) => {
    if (id === 'journal' || id === 'moments') {
      setActiveFeature(activeFeature === id ? null : id);
    } else {
      toast.info(`${features.find(f => f.id === id)?.title} coming soon!`);
    }
  };

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
            const isActive = activeFeature === feature.id;
            const isImplemented = feature.id === 'journal' || feature.id === 'moments';
            return (
              <Card
                key={feature.id}
                className={`hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 ${isActive ? 'border-violet-400 dark:border-violet-600 shadow-lg' : 'hover:border-violet-300 dark:hover:border-violet-700'}`}
                onClick={() => handleFeatureClick(feature.id)}
              >
                <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      {isImplemented && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">✓ Available</span>
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
                    {isActive ? 'Close' : 'Explore'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Feature Panel */}
        {activeFeature === 'journal' && (
          <Card className="mb-8 border-2 border-amber-300 dark:border-amber-700">
            <CardContent className="p-4 md:p-6">
              <MemoryJournal onClose={() => setActiveFeature(null)} />
            </CardContent>
          </Card>
        )}

        {activeFeature === 'moments' && (
          <Card className="mb-8 border-2 border-orange-300 dark:border-orange-700">
            <CardContent className="p-4 md:p-6">
              <GratefulMoments onClose={() => setActiveFeature(null)} />
            </CardContent>
          </Card>
        )}

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