import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Brain, Sparkles, Play, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function MemorySessions() {
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessionContent, setSessionContent] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const sessionTypes = [
    {
      id: 1,
      title: 'Reminiscence Therapy',
      description: 'Guided conversation about cherished memories from your favorite era',
      icon: '📸',
      color: 'from-amber-400 to-orange-500',
      prompt: 'Guide me through a nostalgic memory from my favorite era, asking thoughtful questions about people, places, and feelings I remember.'
    },
    {
      id: 2,
      title: 'Life Stories',
      description: 'Share significant moments and milestones from your life journey',
      icon: '📖',
      color: 'from-blue-400 to-purple-500',
      prompt: 'Help me explore and reflect on important life milestones - career moments, family celebrations, achievements, and turning points.'
    },
    {
      id: 3,
      title: 'Family Connections',
      description: 'Reconnect with memories of loved ones and family bonds',
      icon: '👨‍👩‍👧‍👦',
      color: 'from-pink-400 to-rose-500',
      prompt: 'Guide me through warm memories of family members, special traditions, and bonds that have shaped my life.'
    },
    {
      id: 4,
      title: 'Creative Exploration',
      description: 'Engage in creative memory exercises and imagination activities',
      icon: '🎨',
      color: 'from-green-400 to-teal-500',
      prompt: 'Lead me through creative memory exercises that spark imagination and connect to past experiences through art, music, and storytelling.'
    },
    {
      id: 5,
      title: 'Sensory Memories',
      description: 'Explore memories through sights, sounds, smells, tastes, and touch',
      icon: '👃',
      color: 'from-purple-400 to-indigo-500',
      prompt: 'Guide me through sensory-rich memories - what did I see, hear, smell, taste, and feel in important moments of my life?'
    },
    {
      id: 6,
      title: 'Holiday Traditions',
      description: 'Relive favorite holiday memories and seasonal celebrations',
      icon: '🎄',
      color: 'from-red-400 to-pink-500',
      prompt: 'Help me remember and celebrate favorite holidays and traditions throughout my life - the joy, the people, the special moments.'
    }
  ];

  const generateSession = async (session) => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: session.prompt,
        add_context_from_internet: false
      });
      const initialMessage = { role: 'assistant', content: response };
      setMessages([initialMessage]);
      setSessionContent({
        title: session.title,
        prompt: session.prompt,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Failed to generate session:', error);
      const errorMessage = { role: 'assistant', content: 'Unable to generate session. Please try again.' };
      setMessages([errorMessage]);
      setSessionContent({
        title: session.title,
        prompt: session.prompt,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const continueSession = async () => {
    setIsGenerating(true);
    try {
      const history = messages.map(m => `${m.role === 'assistant' ? 'AI' : 'User'}: ${m.content}`).join('\n\n');
      const continuationPrompt = `You are continuing a memory session about "${sessionContent.title}". 
Here is the conversation so far:
${history}

Please continue the session with the next thoughtful question or reflection, building naturally on what was just shared. Keep the tone warm, supportive, and engaging.`;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: continuationPrompt,
        add_context_from_internet: false
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Failed to continue session:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Unable to continue session. Please try again.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (sessionContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
            <button
              onClick={() => { setSessionContent(null); setMessages([]); }}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Sessions
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {sessionContent.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Started at {sessionContent.timestamp}
            </p>
          </div>

          {/* Conversation Thread */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6 space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                {index < messages.length - 1 && (
                  <hr className="border-slate-200 dark:border-slate-700 mt-6" />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 flex flex-col gap-3">
            <button
              onClick={continueSession}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all min-h-[44px]"
            >
              <ChevronRight className="w-5 h-5" />
              {isGenerating ? 'Continuing...' : 'Continue Session'}
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => { setSessionContent(null); setMessages([]); }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all min-h-[44px]"
              >
                Start Another Session
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg font-semibold transition-all min-h-[44px]"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Memory Sessions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            AI-guided interactive memory activities designed to spark joy and reflection
          </p>
        </div>

        {/* Intro Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex gap-4">
            <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
                How Memory Sessions Work
              </h2>
              <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                Each session is a personalized, AI-guided experience designed to help you explore and celebrate memories. 
                Choose a session type below to begin. The AI will ask thoughtful questions and create a safe, supportive 
                space for reminiscence and reflection.
              </p>
            </div>
          </div>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sessionTypes.map((session) => (
            <div
              key={session.id}
              onClick={() => !isGenerating && setSelectedSession(session)}
              className="group cursor-pointer"
            >
              <div
                className={`bg-gradient-to-br ${session.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {session.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {session.title}
                </h3>
                <p className="text-white/90 text-sm mb-6 flex-grow">
                  {session.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    generateSession(session);
                  }}
                  disabled={isGenerating}
                  className={`flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed ${isGenerating ? 'opacity-50' : ''}`}
                >
                  <Play className="w-4 h-4" />
                  {isGenerating ? 'Loading...' : 'Start Session'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Tips for the Best Experience
          </h2>
          <ul className="space-y-3 text-slate-700 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
              <span>Find a quiet, comfortable space where you can relax and think</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
              <span>Take your time answering questions - there's no rush</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
              <span>Share as much or as little as you'd like</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
              <span>Return to favorite sessions whenever you want</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}