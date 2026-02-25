import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Camera, Calendar, Heart, MessageCircle, Music, BookOpen, ArrowLeft, Send, Loader2, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import MemoryTimelineBuilder from '@/components/family/MemoryTimelineBuilder';

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
              onClick={getSuggestions}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 min-h-[44px]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Songs 🎵'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {suggestions?.songs?.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Songs from {year}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestions.songs.map((song, idx) => (
              <Card key={idx} className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{song.title}</p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">{song.artist}</p>
                      {song.why_memorable && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{song.why_memorable}</p>
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

/* ─────────────────────────────────────────────
   Main YouthMirror Component
───────────────────────────────────────────── */
export default function YouthMirror() {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 'moments',
      title: 'Grateful Moments',
      description: 'Daily prompts to capture what you\'re grateful for',
      icon: Heart,
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 'journal',
      title: 'Memory Journal',
      description: 'Write down thoughts, feelings, and memories',
      icon: BookOpen,
      color: 'from-amber-500 to-yellow-500',
    },
    {
      id: 'chat',
      title: 'AI Chat Buddy',
      description: 'Talk about your day, memories, or anything on your mind',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'timeline',
      title: 'Life Timeline',
      description: 'Build your personal history with photos, stories, and milestones',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'music',
      title: 'Music from Your Life',
      description: 'Discover songs from important years and create playlists',
      icon: Music,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'selfie',
      title: 'Memory Selfie',
      description: 'Capture moments with your camera',
      icon: Camera,
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  if (activeFeature === 'moments') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <GratefulMoments onBack={() => setActiveFeature(null)} />
      </div>
    </div>
  );

  if (activeFeature === 'journal') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <MemoryJournal onBack={() => setActiveFeature(null)} />
      </div>
    </div>
  );

  if (activeFeature === 'chat') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <AIChatBuddy onBack={() => setActiveFeature(null)} />
      </div>
    </div>
  );

  if (activeFeature === 'timeline') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setActiveFeature(null)} className="gap-2 min-h-[44px] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <MemoryTimelineBuilder />
      </div>
    </div>
  );

  if (activeFeature === 'music') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <MusicFromYourLife onBack={() => setActiveFeature(null)} />
      </div>
    </div>
  );

  if (activeFeature === 'selfie') return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-fuchsia-950 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature(null)} className="gap-2 min-h-[44px]">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Camera className="w-6 h-6 text-blue-500" /> Memory Selfie
        </h2>
        <p className="text-slate-600 dark:text-slate-400">Use your device camera to capture a memory moment.</p>
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <Camera className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">Take a photo to preserve this moment in your memory bank.</p>
            <Button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.capture = 'user';
                input.onchange = (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    toast.success(`Photo "${file.name}" captured! Add it to your memories in the Photo Library.`);
                  }
                };
                input.click();
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 min-h-[44px]"
            >
              <Camera className="w-4 h-4 mr-2" /> Open Camera
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

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