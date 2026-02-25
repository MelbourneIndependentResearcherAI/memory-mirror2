import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, X, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

// Memory Journal mini-component
function MemoryJournal({ onClose }) {
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: journalEntries = [], isLoading } = useQuery({
    queryKey: ['youthJournal'],
    queryFn: () => base44.entities.CareJournal.list('-created_date', 20),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareJournal.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthJournal'] });
      setEntry('');
      setTitle('');
      toast.success('Journal entry saved!');
    },
    onError: () => toast.error('Failed to save entry'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CareJournal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['youthJournal'] });
      toast.success('Entry deleted');
    },
  });

  const handleSave = () => {
    if (!entry.trim()) {
      toast.error('Please write something first');
      return;
    }
    createMutation.mutate({
      title: title.trim() || 'Memory Journal Entry',
      content: entry.trim(),
      mood: 'reflective',
      entry_type: 'youth_mirror',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Memory Journal</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
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
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 min-h-[44px]`}>
                    Explore
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
              memories, relationships, and life stories while they can.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
              Your today becomes your tomorrow's comfort. Start building your memory bank now.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {activeModal === 'journal' && <MemoryJournal onClose={() => setActiveModal(null)} />}
      {activeModal === 'moments' && <GratefulMoments onClose={() => setActiveModal(null)} />}
    </div>
  );
}
