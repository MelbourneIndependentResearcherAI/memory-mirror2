import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Plus, Send, Loader2, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

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

// ── AI Chat Buddy Panel ────────────────────────────────────────────────────────
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
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import YouthMirrorCamera from '@/components/memory-mirror/YouthMirror';

export default function YouthMirror() {
  const [showCamera, setShowCamera] = useState(false);
import { createPageUrl } from '@/utils';
import MemorySelfie from '@/components/memory-mirror/YouthMirror';

export default function YouthMirror() {
  const [_activeFeature, setActiveFeature] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);
  const navigate = useNavigate();

  const features = [
    {
      id: 'selfie',
      title: 'Memory Selfie',
      description: 'See a gentle reflection of your younger self with era-based vintage filters',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
      available: false,
      action: () => setShowCamera(true)
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      available: false,
      action: () => navigate('/FamilyTimeline')
    },
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: 'Daily prompts to capture what you\'re grateful for',
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      available: true,
      action: () => navigate('/CareJournalPage')
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      available: false,
      action: () => navigate('/Home')
    },
    {
      id: 'collage',
      title: 'Memory Collages',
      description: 'Browse and share photos of your favorite memories',
      icon: Image,
      color: 'from-pink-500 to-rose-500',
      available: false,
      action: () => navigate('/FamilyPhotoAlbum')
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500',
      available: false,
      action: () => navigate('/MusicTherapy')
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
      action: () => navigate('/SharedJournal')
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div
            className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors mb-4"
            onClick={() => fileRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg object-cover" />
            ) : (
              <>
                <Camera className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-blue-600 dark:text-blue-400 font-medium">Tap to choose a photo</p>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add a caption or memory note..." className="mb-4" />
          <Button onClick={handleSave} disabled={isUploading || !selectedFile} className="bg-blue-500 hover:bg-blue-600 min-h-[44px]">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
            Save Memory Selfie
          </Button>
        </CardContent>
      </Card>

      {isLoading ? <p className="text-center text-slate-500">Loading your selfies...</p> : selfies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Your Memory Selfies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selfies.map(m => (
              <Card key={m.id} className="overflow-hidden">
                {m.image_url ? (
                  <img src={m.image_url} alt={m.title} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl">📸</div>
                )}
                <CardContent className="p-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{m.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Memory Collages Panel ──────────────────────────────────────────────────────
function MemoryCollagesPanel() {
  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['memories-with-images'],
    queryFn: () => base44.entities.Memory.list('-created_date', 50),
    select: (data) => data.filter(m => m.image_url),
  });

  if (isLoading) return <p className="text-center text-slate-500 py-8">Loading your photo memories...</p>;

  if (memories.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800">
        <CardContent className="p-8 text-center">
          <Image className="w-16 h-16 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No photos yet</h3>
          <p className="text-slate-500">Add photos using the Memory Selfie feature and they'll appear here in your collage.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{memories.length} photo memor{memories.length === 1 ? 'y' : 'ies'} in your collection</p>
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {memories.map(m => (
          <div key={m.id} className="break-inside-avoid">
            <Card className="overflow-hidden">
              <img src={m.image_url} alt={m.title} className="w-full object-cover" />
              <CardContent className="p-2">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{m.title}</p>
                {m.created_date && <p className="text-xs text-slate-400">{format(new Date(m.created_date), 'MMM d, yyyy')}</p>}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main YouthMirror Page ──────────────────────────────────────────────────────
export default function YouthMirror() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    { id: 'selfie',   title: 'Memory Selfie',       description: 'Capture moments with photos from your favourite times', icon: Camera,        color: 'from-blue-500 to-cyan-500' },
    { id: 'timeline', title: 'Life Timeline',        description: 'Build your personal history with photos, stories, and milestones', icon: Calendar,      color: 'from-purple-500 to-pink-500' },
    { id: 'moments',  title: 'Grateful Moments',     description: "Daily prompts to capture what you're grateful for",    icon: Heart,         color: 'from-orange-500 to-red-500' },
    { id: 'chat',     title: 'AI Chat Buddy',        description: 'Talk about your day, memories, or anything on your mind', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { id: 'collage',  title: 'Memory Collages',      description: 'View your photo memories in a beautiful collage layout', icon: Image,         color: 'from-pink-500 to-rose-500' },
    { id: 'music',    title: 'Music from Your Life', description: 'Discover songs from important years and create playlists', icon: Music,         color: 'from-indigo-500 to-purple-500' },
    { id: 'journal',  title: 'Memory Journal',       description: 'Write down thoughts, feelings, and memories',          icon: BookOpen,      color: 'from-amber-500 to-yellow-500' },
  ];

  const FEATURE_PANELS = {
    moments:  <GratefulMomentsPanel />,
    journal:  <MemoryJournalPanel />,
    timeline: <LifeTimelinePanel />,
    chat:     <AIChatBuddyPanel />,
    music:    <MusicFromYourLifePanel />,
    selfie:   <MemorySelfiePanel />,
    collage:  <MemoryCollagesPanel />,
  };

  const activeFeatureData = features.find(f => f.id === activeFeature);
  if (showCamera) {
    return (
      <div className="min-h-screen">
        <button
          onClick={() => setShowCamera(false)}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Youth Mirror
        </button>
        <YouthMirrorCamera />
  const featureRoutes = {
    timeline: createPageUrl('FamilyTimeline'),
    moments: createPageUrl('SharedJournal'),
    chat: createPageUrl('ChatMode'),
    collage: createPageUrl('FamilyMediaAlbum'),
    music: createPageUrl('FamilyMusic'),
    journal: createPageUrl('FamilyStories'),
  };

  const handleFeatureClick = (feature) => {
    if (feature.id === 'selfie') {
      setActiveFeature('selfie');
    } else {
      navigate(featureRoutes[feature.id]);
    }
  };

  if (activeFeature === 'selfie') {
    return (
      <div className="min-h-screen">
        <div className="p-4">
          <button
            onClick={() => setActiveFeature(null)}
            className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 mb-4 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Youth Mirror
          </button>
        </div>
        <MemorySelfie />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {activeFeature && (
            <div className="flex justify-start mb-4">
              <Button variant="ghost" onClick={() => setActiveFeature(null)} className="gap-2 min-h-[44px] text-violet-700 dark:text-violet-300 hover:text-violet-900">
                <ArrowLeft className="w-5 h-5" /> Back to features
              </Button>
            </div>
          )}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-2xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Youth Mirror
          </h1>
          {!activeFeature && (
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Capture your memories today, so you can treasure them tomorrow
            </p>
          )}
        </div>

        {/* Active feature panel */}
        {activeFeature ? (
          <div>
            {activeFeatureData && (
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeFeatureData.color} flex items-center justify-center shadow-lg`}>
                  <activeFeatureData.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{activeFeatureData.title}</h2>
                  <p className="text-sm text-slate-500">{activeFeatureData.description}</p>
                </div>
              </div>
            )}
            {FEATURE_PANELS[activeFeature]}
          </div>
        ) : (
          <>
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
                    onClick={() => setActiveFeature(feature.id)}
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
          </>
        )}
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
                onClick={feature.action}
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
                    onClick={feature.action}
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

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Youth Mirror — Preserving your memories for the future 💜
          </p>
        </div>
      </div>
    </div>
  );
}