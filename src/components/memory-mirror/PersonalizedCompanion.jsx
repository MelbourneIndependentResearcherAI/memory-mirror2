import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Sparkles, BookOpen, Music, Image, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PersonalizedCompanion({ onStartConversation, currentAnxiety = 0, emotionalState = 'neutral' }) {
  const [loading, setLoading] = useState(false);
  const [proactiveCheck, setProactiveCheck] = useState(null);
  const [conversationOptions, setConversationOptions] = useState(null);

  // Check for proactive engagement opportunities
  useEffect(() => {
    const checkProactive = async () => {
      try {
        const { data } = await base44.functions.invoke('proactiveEngagement', {});
        if (data.engagement?.should_engage && data.engagement?.confidence > 60) {
          setProactiveCheck(data.engagement);
        }
      } catch (error) {
        console.log('Proactive check:', error);
      }
    };

    checkProactive();
    const interval = setInterval(checkProactive, 300000); // Every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const generatePersonalizedConversation = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generatePersonalizedConversation', {
        emotionalState,
        anxietyLevel: currentAnxiety,
        currentContext: 'companion mode'
      });

      setConversationOptions(data.conversation);
      toast.success('Personalized conversation ready!');
    } catch (error) {
      toast.error('Could not generate conversation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedStory = async (theme = 'family') => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generatePersonalizedStory', {
        contentType: 'story',
        theme,
        mood: currentAnxiety > 5 ? 'calm' : 'peaceful'
      });

      toast.success(`Created: ${data.creative.title}`);
      
      // Navigate to story or display it
      if (onStartConversation) {
        onStartConversation({
          type: 'story',
          content: data.creative
        });
      }
    } catch (error) {
      toast.error('Could not create story');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedPoem = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generatePersonalizedStory', {
        contentType: 'poem',
        theme: 'love and memories',
        mood: 'nostalgic'
      });

      toast.success(`Created: ${data.creative.title}`);
      
      if (onStartConversation) {
        onStartConversation({
          type: 'poem',
          content: data.creative
        });
      }
    } catch (error) {
      toast.error('Could not create poem');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Proactive Engagement Alert */}
      {proactiveCheck && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-2">
                Perfect Moment to Connect
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                {proactiveCheck.conversation_starter}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                <strong>Suggestion:</strong> {proactiveCheck.specific_suggestion}
              </p>
              <Button 
                onClick={() => onStartConversation && onStartConversation({ 
                  type: 'proactive',
                  starter: proactiveCheck.conversation_starter 
                })}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start This Conversation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Personalized Conversation Options */}
      {conversationOptions && (
        <Card className="p-6 bg-white dark:bg-slate-900">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Conversation Starters
          </h3>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            {conversationOptions.primary_response}
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => onStartConversation && onStartConversation({ 
                type: 'question',
                text: conversationOptions.conversation_options.question 
              })}
            >
              <div>
                <div className="font-medium mb-1">Ask a Question</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {conversationOptions.conversation_options.question}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => onStartConversation && onStartConversation({ 
                type: 'activity',
                text: conversationOptions.conversation_options.activity 
              })}
            >
              <div>
                <div className="font-medium mb-1">Suggest Activity</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {conversationOptions.conversation_options.activity}
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => onStartConversation && onStartConversation({ 
                type: 'memory',
                text: conversationOptions.conversation_options.memory_prompt 
              })}
            >
              <div>
                <div className="font-medium mb-1">Explore Memory</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {conversationOptions.conversation_options.memory_prompt}
                </div>
              </div>
            </Button>
          </div>
        </Card>
      )}

      {/* Companion Actions */}
      <Card className="p-6 bg-white dark:bg-slate-900">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-600" />
          Personalized Companionship
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={generatePersonalizedConversation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <MessageCircle className="w-6 h-6 text-blue-600" />
            )}
            <div className="text-center">
              <div className="font-medium">Get Conversation Ideas</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Based on current mood
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => generatePersonalizedStory('family')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <BookOpen className="w-6 h-6 text-green-600" />
            )}
            <div className="text-center">
              <div className="font-medium">Create Personal Story</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                From their life memories
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={generatePersonalizedPoem}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Sparkles className="w-6 h-6 text-purple-600" />
            )}
            <div className="text-center">
              <div className="font-medium">Create Personal Poem</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Celebrating their life
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => generatePersonalizedStory('comfort')}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Heart className="w-6 h-6 text-rose-600" />
            )}
            <div className="text-center">
              <div className="font-medium">Comfort Story</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                Soothing and familiar
              </div>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}