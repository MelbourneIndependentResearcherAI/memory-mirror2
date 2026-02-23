import React, { useState } from 'react';
import { BookOpen, Sparkles, Play, Pause, RotateCw, X, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice } from './voiceUtils';
import PersonalizedStoryGenerator from './PersonalizedStoryGenerator';

export default function StoryTeller({ currentEra, currentMood = 'peaceful', userProfile, onClose }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTelling, setIsTelling] = useState(false);
  const [showPersonalizedGenerator, setShowPersonalizedGenerator] = useState(false);

  const { data: stories = [] } = useQuery({
    queryKey: ['stories', currentEra],
    queryFn: async () => {
      const allStories = await base44.entities.Story.list();
      return allStories.filter(s => s.era === currentEra || s.era === 'any');
    },
  });

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const themes = ['family', 'friendship', 'nature', 'adventure', 'comfort'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a short, simple, comforting story (2-3 paragraphs) set in the ${currentEra} era. 
        Theme: ${randomTheme}. Mood: ${currentMood}.
        The story should be easy to follow, use sensory details, and evoke warm feelings.
        Include era-appropriate references to daily life, popular culture, or common experiences from ${currentEra}.
        Make it personal and relatable. Do not include a title.`,
      });

      const storyContent = typeof response === 'string' ? response : response.content || response.text;
      setSelectedStory({
        title: 'A Story for You',
        content: storyContent,
        generated: true
      });
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tellStory = () => {
    if (!selectedStory) return;
    
    if (isTelling) {
      window.speechSynthesis.cancel();
      setIsTelling(false);
    } else {
      setIsTelling(true);
      
      // Add introduction
      const intro = selectedStory.narrator_note 
        ? `${selectedStory.narrator_note}... ` 
        : "Let me tell you a story... ";
      
      speakWithRealisticVoice(intro + selectedStory.content, {
        rate: 0.85,
        pitch: 1.0,
        volume: 1.0
      });
      
      // Log activity
      base44.entities.ActivityLog.create({
        activity_type: 'memory_viewed',
        details: { type: 'story', title: selectedStory.title, era: currentEra }
      }).catch(() => {});
      
      // Monitor for completion
      const checkCompletion = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsTelling(false);
          clearInterval(checkCompletion);
        }
      }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">Story Time</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPersonalizedGenerator(true)}
            className="h-8 w-8"
            title="Create Personalized Story"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {showPersonalizedGenerator && (
        <PersonalizedStoryGenerator
          userProfile={userProfile}
          onStoryGenerated={(story) => {
            setSelectedStory(story);
            setShowPersonalizedGenerator(false);
          }}
          onClose={() => setShowPersonalizedGenerator(false)}
        />
      )}

      {!selectedStory ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {stories.slice(0, 4).map((story) => (
              <Button
                key={story.id}
                variant="outline"
                onClick={() => setSelectedStory(story)}
                className="h-auto p-3 flex flex-col items-start text-left hover:bg-amber-50 dark:hover:bg-amber-950"
              >
                <span className="font-semibold text-sm">{story.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{story.theme}</span>
              </Button>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={generateStory}
              disabled={isGenerating}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowPersonalizedGenerator(true)}
              variant="outline"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Custom
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100 mb-3">
              {selectedStory.title}
            </h3>
            <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedStory.content}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={tellStory}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
              {isTelling ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Tell Story
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedStory(null)}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}