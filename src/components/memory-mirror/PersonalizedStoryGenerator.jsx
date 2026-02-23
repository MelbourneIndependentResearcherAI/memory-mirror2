import React, { useState } from 'react';
import { BookOpen, Sparkles, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const NARRATIVE_STYLES = [
  { id: 'adventure', label: 'Adventure', description: 'Exciting journeys and exploration' },
  { id: 'romance', label: 'Romance', description: 'Heartfelt love and connection' },
  { id: 'comedy', label: 'Comedy', description: 'Humor and light-hearted moments' },
  { id: 'mystery', label: 'Mystery', description: 'Intriguing puzzles and discoveries' },
  { id: 'family', label: 'Family', description: 'Close bonds and togetherness' },
  { id: 'inspiration', label: 'Inspiration', description: 'Uplifting and empowering' }
];

const CONTENT_TYPES = [
  { id: 'story', label: 'Story', description: 'A complete narrative (5-10 min read)' },
  { id: 'poem', label: 'Poem', description: 'Beautiful verses (1-2 min read)' },
  { id: 'meditation', label: 'Meditation', description: 'Calming guided narrative' }
];

export default function PersonalizedStoryGenerator({ userProfile, onStoryGenerated, onClose }) {
  const [contentType, setContentType] = useState('story');
  const [narrativeStyle, setNarrativeStyle] = useState('family');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePersonalizedStory = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generatePersonalizedStory', {
        contentType,
        theme: narrativeStyle,
        mood: 'warm',
        userProfile: {
          name: userProfile?.loved_one_name,
          interests: userProfile?.interests,
          favoriteEra: userProfile?.favorite_era,
          importantPeople: userProfile?.important_people
        }
      });

      if (response.data?.creative) {
        toast.success('Story created just for you!');
        onStoryGenerated?.(response.data.creative);
        onClose();
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Story generation failed:', error);
      toast.error('Failed to create story');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-amber-200 dark:border-amber-800"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Create Your Story
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* Content Type Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            What would you like?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {CONTENT_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setContentType(type.id)}
                className={`p-4 rounded-lg transition-all text-left ${
                  contentType === type.id
                    ? 'bg-amber-500 text-white border-2 border-amber-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-amber-300'
                }`}
              >
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs opacity-80 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Narrative Style */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Narrative Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {NARRATIVE_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setNarrativeStyle(style.id)}
                className={`p-3 rounded-lg transition-all text-left ${
                  narrativeStyle === style.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <div className="font-semibold text-sm">{style.label}</div>
                <div className="text-xs opacity-75">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-900 dark:text-amber-200">
            ✨ This story will be personalized based on your profile, interests, and memories. Each story is unique and created just for you.
          </p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePersonalizedStory}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 rounded-lg h-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating Your Story...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Personalized Story
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}