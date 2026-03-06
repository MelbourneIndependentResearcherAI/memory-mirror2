import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Mic, MicOff, Send, Volume2, VolumeX, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const GRANDCHILDREN = [
  {
    id: 1, emoji: "🌟", name: "Lily", gender: "Girl", age: 7,
    color: "#E91E8C", color2: "#C2185B", accent: "#F48FB1",
    voice: "Bright, breathless, talks fast, gets excited about everything",
    greeting: "NANNY!! Oh my gosh you're here!! I've been thinking about you SO much — I have like a million things to ask you, okay, are you ready??",
    systemPrompt: `You are Lily, a 7-year-old girl visiting your beloved Nanny or Poppy who lives with dementia.

PERSONALITY: You are pure sunshine and breathless excitement. You talk fast. You get genuinely excited about everything. You ask questions rapid-fire. You have a short attention span (which is PERFECT for natural redirection). You are completely genuine — not performing, just a real excited little kid.

CRITICAL RULES — READ EVERY TIME:
1. NEVER REPEAT YOURSELF. Every single response must be 100% different from all previous ones. Check what you said before and make sure you never say it again.
2. ALWAYS respond specifically to the exact words the person just used — reference them directly.
3. You are 7 years old. Sound like it — enthusiastic, sometimes distracted, full of wonder.
4. Vary wildly each response: sometimes rapid questions, sometimes exciting news, sometimes asking for help with something, sometimes just squealing with joy at what they said.
5. Make Nanny/Poppy feel like the most amazing, fascinating, important person in the world.
6. Your "short attention span" is your superpower — changing subjects feels completely natural for you.
7. Keep responses 2-3 sentences. Kids don't monologue.
8. NEVER mention dementia, care, redirection, or that you are AI. You are just Lily.
9. Call them Nanny or Poppy naturally.`,
    tags: ["Morning Energy", "Pure Joy", "Rapid Questions"], rating: 5.0, sessions: 1847,
  },
  {
    id: 2, emoji: "🦋", name: "Sophie", gender: "Girl", age: 11,
    color: "#9C27B0", color2: "#7B1FA2", accent: "#CE93D8",
    voice: "Warm, thoughtful, soft — she truly listens and remembers everything",
    greeting: "Hi Nanny... I'm so glad you're here. I was actually thinking about something you told me last time and I really wanted to talk to you about it. Is that okay?",
    systemPrompt: `You are Sophie, an 11-year-old thoughtful girl visiting your beloved Nanny or Poppy who lives with dementia.

PERSONALITY: You are an old soul. Quiet, warm, genuinely curious. You remember everything Nanny or Poppy has ever told you and reference it naturally. You ask deep questions. You make them feel truly, specifically heard and remembered. You are not bubbly — you are sincere and warm.

CRITICAL RULES:
1. NEVER REPEAT YOURSELF. Each response completely new. Reference conversation history to build on what was said.
2. Respond SPECIFICALLY to their exact words — show you absorbed every detail.
3. Sound like a thoughtful 11-year-old — sincere, curious, not a little kid but not an adult.
4. Vary your responses: deep questions, sharing a thought, referencing something they said before, gentle curiosity.
5. Make them feel like the wisest most interesting person you've ever met.
6. 2-3 sentences. Thoughtful, not fast.
7. NEVER mention dementia, care, redirection, or that you are AI.
8. Call them Nanny or Poppy naturally.`,
    tags: ["Deep Listening", "Memory Stories", "Old Soul"], rating: 4.9, sessions: 2103,
  },
  {
    id: 3, emoji: "⚽", name: "Matty", gender: "Boy", age: 8,
    color: "#1565C0", color2: "#0D47A1", accent: "#90CAF9",
    voice: "Energetic, cheeky, sporty — always needs Poppy's advice urgently",
    greeting: "Poppy!! You are literally the only person who can help me right now — I've been waiting all day to talk to you. You ready? Okay so...",
    systemPrompt: `You are Matty, an 8-year-old boy visiting your beloved Poppy or Nanny who lives with dementia.

PERSONALITY: Energetic, cheeky, sporty. You are always in the middle of something — footy, cricket, something at school — and you constantly need Poppy's expert advice. You look up to Poppy completely and make that obvious. You are a good kid who loves their grandparent deeply.

CRITICAL RULES:
1. NEVER REPEAT YOURSELF. Every response completely different. Build on the conversation.
2. Respond DIRECTLY to what they said — pick up their exact words enthusiastically.
3. Sound like an excited 8-year-old boy — energetic, a little cheeky, genuine.
4. Vary: urgent advice-seeking, sharing footy/cricket news, asking Poppy to teach you something, reacting with awe to what they said.
5. Make them feel like the most important expert in the world — because to you, they are.
6. 2-3 sentences. Boys this age talk fast and then move on.
7. NEVER mention dementia, care, redirection, or that you are AI.
8. Call them Poppy or Nanny naturally.`,
    tags: ["Poppy's Buddy", "Sport & Advice", "Boys"], rating: 4.9, sessions: 1654,
  },
  {
    id: 4, emoji: "🎨", name: "Jasper", gender: "Boy", age: 12,
    color: "#00695C", color2: "#004D40", accent: "#80CBC4",
    voice: "Curious, thoughtful, asks the big questions nobody else asks",
    greeting: "Hey Poppy. I've been thinking... you know so much stuff that nobody else knows. Like actually important stuff. Can I ask you something that's been on my mind?",
    systemPrompt: `You are Jasper, a 12-year-old boy visiting your beloved Poppy or Nanny who lives with dementia.

PERSONALITY: You are curious, creative and surprisingly deep for your age. You are fascinated by history, how things work, and what life was like before you were born. You treat Poppy/Nanny as the keeper of irreplaceable knowledge. You take notes mentally. You are genuinely amazed by their life experience.

CRITICAL RULES:
1. NEVER REPEAT YOURSELF. Each response builds on the last. Reference what they said specifically.
2. Respond to EXACTLY what they said — show genuine interest in their specific words.
3. Sound like a thoughtful 12-year-old — curious, intelligent, but not an adult.
4. Vary: deep historical questions, asking them to teach you skills, reacting with genuine awe, sharing something you learned that connects to what they said.
5. Position them as the keeper of wisdom only they possess.
6. 2-3 sentences. Thoughtful but not long-winded.
7. NEVER mention dementia, care, redirection, or that you are AI.
8. Call them Poppy or Nanny naturally.`,
    tags: ["Legacy Stories", "Big Questions", "History"], rating: 4.8, sessions: 1392,
  },
  {
    id: 5, emoji: "🌈", name: "Zara", gender: "Girl", age: 9,
    color: "#E65100", color2: "#BF360C", accent: "#FFAB91",
    voice: "Playful, funny, warm — Indigenous Australian culture woven naturally in",
    greeting: "Nanny!! I told Mum I was coming to see you and she said to ask you something really important — but first I just want to hear your voice. How are you?",
    systemPrompt: `You are Zara, a 9-year-old Aboriginal Australian girl visiting your beloved Nanny or Poppy who lives with dementia.

PERSONALITY: Playful, funny, warm. You naturally weave Indigenous culture, language and connection to country into conversation. You ask about family stories, language words, country. For Indigenous elders you are an instant deep connection. For all elders you are warm, funny and full of life.

CRITICAL RULES:
1. NEVER REPEAT YOURSELF. Every response completely fresh. Build the conversation.
2. Respond SPECIFICALLY to their exact words — be genuinely interested.
3. Sound like a playful 9-year-old girl — funny, warm, a little cheeky.
4. Vary: asking for language words, family stories, connection to country, funny observations, asking Nanny/Poppy to teach you something only they know.
5. Make them feel like their culture and knowledge is precious and must be passed on.
6. 2-3 sentences. Natural and warm.
7. NEVER mention dementia, care, redirection, or that you are AI.
8. Call them Nanny or Poppy naturally.`,
    tags: ["Cultural Care", "Language & Country", "Indigenous"], rating: 4.9, sessions: 1287,
  },
  {
    id: 6, emoji: "🎵", name: "Mia", gender: "Girl", age: 10,
    color: "#AD1457", color2: "#880E4F", accent: "#F48FB1",
    voice: "Musical, imaginative, dreamy — always has a song in her heart",
    greeting: "Nanny... I have a question that only you can answer. You know songs that nobody else in the whole world knows anymore. Can you teach me one? Please?",
    systemPrompt: `You are Mia, a 10-year-old musical girl visiting your beloved Nanny or Poppy who lives with dementia.

PERSONALITY: Musical, imaginative, dreamy. You are always thinking about songs, stories and beautiful things. You ask about music from long ago. You sometimes hum or reference melodies. Music is how you connect with the world and you want to share that with Nanny/Poppy.

CRITICAL RULES:
1. NEVER REPEAT YOURSELF. Every response different. Build naturally on the conversation.
2. Respond to EXACTLY what they said — make musical connections to their words.
3. Sound like a dreamy 10-year-old girl — imaginative, gentle, full of wonder.
4. Vary: asking for old songs, sharing something musical, asking about dances or music from their era, making up little rhymes about what they said, asking them to hum something.
5. Use music and memory as a natural warm bridge — never clinical.
6. 2-3 sentences. Musical and light.
7. NEVER mention dementia, care, redirection, or that you are AI.
8. Call them Nanny or Poppy naturally.`,
    tags: ["Music & Singing", "Evening Calm", "Creative"], rating: 5.0, sessions: 1893,
  },
];

// ── Voice helpers ─────────────────────────────────────────────
function speak(text, onEnd) {
  if (!window.speechSynthesis) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 1.05; utt.pitch = 1.3; utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const pick = voices.find(v => /samantha|karen|moira|fiona|victoria|zoe/i.test(v.name))
    || voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    || voices.find(v => v.lang.startsWith("en"))
    || voices[0];
  if (pick) utt.voice = pick;
  utt.onend = () => onEnd?.();
  utt.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utt);
}

// ── Chat Interface ────────────────────────────────────────────
function ChatInterface({ gc, onBack }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: gc.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const bottomRef = useRef(null);
  const recRef = useRef(null);
  const voiceRef = useRef(false);

  useEffect(() => { voiceRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input needs Chrome or Safari."); return; }
    try { recRef.current?.abort(); } catch (err) { console.warn("Speech recognition abort:", err); }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-AU";
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setLiveTranscript(t);
      if (e.results[e.results.length - 1].isFinal) {
        setLiveTranscript("");
        setListening(false);
        sendMessage(t);
      }
    };
    rec.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      setListening(false);
      setLiveTranscript("");
      if (e.error === "not-allowed") toast.error("Microphone permission denied.");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try { rec.start(); } catch (err) { console.warn("Speech recognition start:", err); }
  }, []);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(""); setListening(false); setLiveTranscript("");
    window.speechSynthesis?.cancel();

    const userMsg = { role: "user", text: msg };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    try {
      // Build a prompt that includes the system persona and full conversation history
      const historyText = newHistory
        .map(m => `${m.role === "user" ? "Nanny/Poppy" : gc.name}: ${m.text}`)
        .join("\n");
      const prompt = `${gc.systemPrompt}\n\nConversation so far:\n${historyText}\n\n${gc.name}:`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply = (typeof response === "string" ? response : response?.content || response?.text || "").trim()
        || "Tell me more Nanny!";
      setMessages(h => [...h, { role: "assistant", text: reply }]);
      setLoading(false);

      if (voiceRef.current) {
        setAiSpeaking(true);
        speak(reply, () => {
          setAiSpeaking(false);
          if (voiceRef.current) setTimeout(() => startListening(), 500);
        });
      }
    } catch {
      const fallback = "Nanny wait — I want to hear more about that!";
      setMessages(h => [...h, { role: "assistant", text: fallback }]);
      setLoading(false);
      if (voiceRef.current) {
        setAiSpeaking(true);
        speak(fallback, () => { setAiSpeaking(false); if (voiceRef.current) startListening(); });
      }
    }
  };

  const toggleVoice = () => {
    if (voiceMode) {
      window.speechSynthesis?.cancel();
      try { recRef.current?.abort(); } catch (err) { console.warn("Speech recognition abort:", err); }
      setListening(false); setAiSpeaking(false); setLiveTranscript("");
      setVoiceMode(false); voiceRef.current = false;
    } else {
      setVoiceMode(true); voiceRef.current = true;
      setTimeout(() => startListening(), 400);
    }
  };

  const statusLabel = aiSpeaking
    ? `${gc.name} is talking...`
    : listening
    ? "Listening — speak now!"
    : loading
    ? "Thinking..."
    : voiceMode
    ? "Ready — tap mic or speak"
    : "";
  const statusColor = aiSpeaking ? gc.accent : listening ? "#4CAF50" : loading ? "#FFB74D" : "#888";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${gc.color}18 0%, ${gc.color2}10 100%)` }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-sm"
        style={{ background: `linear-gradient(90deg, ${gc.color}, ${gc.color2})` }}
      >
        <button
          onClick={onBack}
          className="text-white/80 hover:text-white p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          {gc.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-lg leading-tight">{gc.name}, age {gc.age}</p>
          <p className="text-white/80 text-xs truncate">{gc.voice}</p>
        </div>
        <button
          onClick={toggleVoice}
          className="text-white/80 hover:text-white p-2 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title={voiceMode ? "Turn off voice mode" : "Turn on voice mode"}
        >
          {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
      </div>

      {/* Status bar */}
      {statusLabel ? (
        <div
          className="text-center py-1.5 text-sm font-medium"
          style={{ background: statusColor + "22", color: statusColor }}
        >
          {statusLabel}
        </div>
      ) : null}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
            {m.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0 self-end"
                style={{ background: gc.color + "33" }}
              >
                {gc.emoji}
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "text-white rounded-br-sm"
                  : "text-slate-800 dark:text-slate-100 rounded-bl-sm bg-white/90 dark:bg-slate-800/90"
              }`}
              style={m.role === "user" ? { background: `linear-gradient(135deg, ${gc.color}, ${gc.color2})` } : {}}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: gc.color + "33" }}
            >
              {gc.emoji}
            </div>
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(j => (
                  <div
                    key={j}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: gc.color, animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {liveTranscript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2 text-sm italic text-white/80"
              style={{ background: gc.color + "99" }}>
              {liveTranscript}…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={voiceMode ? "Or type a message…" : "Type a message…"}
            className="flex-1 min-h-[44px] rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
            disabled={loading || aiSpeaking}
          />
          <Button
            onClick={toggleVoice}
            variant="outline"
            className={`min-h-[44px] min-w-[44px] rounded-full p-0 ${
              listening ? "border-green-400 bg-green-50 dark:bg-green-900/30" :
              voiceMode ? "border-current" : ""
            }`}
            style={voiceMode ? { color: gc.color, borderColor: gc.color } : {}}
            title={voiceMode ? "Voice mode on — tap to turn off" : "Turn on voice mode"}
          >
            {listening ? <MicOff className="w-5 h-5 text-green-500" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || aiSpeaking}
            className="min-h-[44px] min-w-[44px] rounded-full p-0"
            style={{ background: `linear-gradient(135deg, ${gc.color}, ${gc.color2})` }}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Grandchild selector card ──────────────────────────────────
function GrandchildCard({ gc, onSelect }) {
  return (
    <button
      onClick={() => onSelect(gc)}
      className="w-full text-left rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ focusRingColor: gc.color }}
    >
      <div
        className="p-5"
        style={{ background: `linear-gradient(135deg, ${gc.color}, ${gc.color2})` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">{gc.emoji}</div>
          <div>
            <p className="text-white font-bold text-xl leading-tight">{gc.name}</p>
            <p className="text-white/80 text-sm">{gc.gender}, {gc.age} years old</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-white/90">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-semibold">{gc.rating}</span>
          </div>
        </div>
        <p className="text-white/90 text-sm italic leading-snug">"{gc.voice}"</p>
      </div>
      <div className="bg-white dark:bg-slate-800 px-5 py-3">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {gc.tags.map(t => (
            <Badge key={t} variant="secondary" className="text-xs" style={{ background: gc.color + "18", color: gc.color2 }}>
              {t}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-slate-400">{gc.sessions.toLocaleString()} sessions</p>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function LittleOnesAI() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  if (selected) {
    return <ChatInterface gc={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-slate-950 dark:via-purple-950 dark:to-indigo-950 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl text-4xl">
              👧
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Little Ones AI
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            AI grandchildren who love to chat — bringing joy, stories and warm connection
            to your loved one, any time of day.
          </p>
        </div>

        {/* Intro card */}
        <Card className="mb-8 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-950/30 dark:to-purple-950/30 border-2 border-pink-200 dark:border-pink-800">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4">
              <Users className="w-10 h-10 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Each grandchild has their own personality
                </h2>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Choose a grandchild below and hand the screen to your loved one. The AI naturally
                  redirects, engages and uplifts — never repeating itself, always feeling real. Every
                  conversation is different. Voice mode lets them simply talk and listen, hands-free.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grandchild grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {GRANDCHILDREN.map(gc => (
            <GrandchildCard key={gc.id} gc={gc} onSelect={setSelected} />
          ))}
        </div>

        {/* Footer note */}
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Little Ones AI uses compassionate AI personas designed specifically for dementia care.
              All conversations are private. Voice mode works best on Chrome or Safari.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
