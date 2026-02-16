import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowLeft, Heart, Camera, Music, Book } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import MemorySession from './MemorySession';

export default function MemorySessionLauncher({ onBack }) {
  const [sessionData, setSessionData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const sessionTypes = [
    {
      type: 'photo_memories',
      icon: Camera,
      title: 'Photo Memories',
      description: 'Explore memories through family photos',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'life_story',
      icon: Book,
      title: 'Life Story',
      description: 'Journey through key life experiences',
      color: 'from-purple-500 to-pink-500'
    },
    {
      type: 'music_memories',
      icon: Music,
      title: 'Music & Memories',
      description: 'Connect through favorite songs',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      type: 'general',
      icon: Heart,
      title: 'Mixed Session',
      description: 'A gentle mix of all memory types',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const generateSession = async (type) => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateMemorySession', {
        sessionType: type
      });
      setSessionData(response.data);
    } catch (error) {
      console.error('Session generation error:', error);
      alert('Failed to generate session. Please make sure you have set up a user profile first.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    alert('Session completed! Great job sharing those memories.');
    setSessionData(null);
  };

  if (sessionData) {
    return (
      <MemorySession 
        sessionData={sessionData}
        onBack={() => setSessionData(null)}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Memory Sessions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            AI-guided interactive memory experiences
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-2">
                How Memory Sessions Work
              </h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• AI creates personalized prompts using your uploaded photos and profile</li>
                <li>• Gentle questions guide storytelling and memory recall</li>
                <li>• Voice recording captures their responses</li>
                <li>• 15-30 minute sessions designed for engagement without fatigue</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessionTypes.map((session) => {
          const Icon = session.icon;
          return (
            <Card 
              key={session.type}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${session.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {session.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-normal">
                      {session.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => generateSession(session.type)}
                  disabled={isGenerating}
                  className={`w-full min-h-[48px] bg-gradient-to-r ${session.color} hover:opacity-90`}
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {isGenerating ? 'Generating...' : 'Start Session'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>💡 Tip:</strong> For the best experience, make sure you've uploaded photos to the Media Library and completed the Personalization Profile first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}