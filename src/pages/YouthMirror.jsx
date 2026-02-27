import React, { useState } from 'react';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Image, Music, BookOpen, ArrowLeft, Trash2, Loader2, Send, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';
import { createPageUrl } from '@/utils';

const GRATITUDE_PROMPTS = [
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
  const [content, setContent] = useState('');

  const { data: entries = [], isLoading } = useQuery({
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

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CareJournal.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['youthJournal'] }),
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
                  <div key={entry.id} className="flex items-start gap-2">
                    <button
                      className="flex-1 text-left p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 transition-colors min-h-[44px]"
                      onClick={() => setSelected(entry)}
                    >
                      <p className="font-medium text-slate-800 dark:text-slate-200">{entry.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{entry.content}</p>
                      {entry.created_date && (
                        <p className="text-xs text-slate-400 mt-1">{format(parseISO(entry.created_date), 'MMM d, yyyy')}</p>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(entry.id)}
                      className="text-slate-400 hover:text-red-500 min-h-[44px] min-w-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GratefulMoments({ onBack }) {
  const queryClient = useQueryClient();
  const [entry, setEntry] = useState('');
  const prompt = GRATITUDE_PROMPTS[new Date().getDay() % GRATITUDE_PROMPTS.length];

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

function MusicFromYourLife({ onBack }) {
  const [year, setYear] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSuggestions = async () => {
    if (!year || isNaN(parseInt(year))) { toast.error('Please enter a valid year.'); return; }
    setIsLoading(true);
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
              onClick={getSuggestions}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions?.songs?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Songs from {year}</h3>
          <div className="space-y-2">
            {suggestions.songs.map((song, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{song.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{song.artist}</p>
                  {song.why_memorable && (
                    <p className="text-xs text-slate-400 mt-1 italic">{song.why_memorable}</p>
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

export default function YouthMirror() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    { id: 'journal', title: 'Memory Journal', description: 'Write down thoughts, feelings, and memories', icon: BookOpen, color: 'from-amber-500 to-yellow-500', page: null },
    { id: 'moments', title: 'Grateful Moments', description: "Daily prompts to capture what you're grateful for", icon: Heart, color: 'from-orange-500 to-red-500', page: null },
    { id: 'chat', title: 'AI Chat Buddy', description: 'Talk about your day, memories, or anything on your mind', icon: MessageCircle, color: 'from-green-500 to-emerald-500', page: null },
    { id: 'music', title: 'Music from Your Life', description: 'Discover songs from important years', icon: Music, color: 'from-indigo-500 to-purple-500', page: null },
    { id: 'timeline', title: 'Life Timeline', description: 'Build your personal history with milestones', icon: Calendar, color: 'from-purple-500 to-pink-500', page: 'FamilyTimeline' },
    { id: 'photos', title: 'Photo Library', description: 'Upload and organise your cherished photos', icon: Camera, color: 'from-blue-500 to-cyan-500', page: 'FamilyPhotoAlbum' },
    { id: 'collage', title: 'Memory Collages', description: 'View your photos in beautiful layouts', icon: Image, color: 'from-pink-500 to-rose-500', page: 'FamilyMediaAlbum' },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.page) {
      navigate(createPageUrl(feature.page));
    } else {
      setActiveFeature(feature.id);
    }
  };

  if (activeFeature === 'journal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <MemoryJournal onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  if (activeFeature === 'moments') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <GratefulMoments onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  if (activeFeature === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <AIChatBuddy onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  if (activeFeature === 'music') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <MusicFromYourLife onBack={() => setActiveFeature(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
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
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
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
              Memory Mirror was built after years of caring for family members with dementia.
              Youth Mirror is the "prequel" — helping young people and adults actively preserve their
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