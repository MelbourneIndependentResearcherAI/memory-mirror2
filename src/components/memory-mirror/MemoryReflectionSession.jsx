import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Music, Image, BookOpen, ChevronRight, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function MemoryReflectionSession({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    loadReflectionSession();
  }, []);

  const loadReflectionSession = async () => {
    try {
      setLoading(true);
      const { data } = await base44.functions.invoke('generateMemoryReflection', {
        reflection_type: 'daily'
      });
      setSession(data);
      setLoading(false);
      setTimeout(() => setShowContent(true), 500);
    } catch (error) {
      console.error('Failed to load reflection:', error);
      toast.error('Could not start reflection session');
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < session.steps.length - 1) {
      setShowContent(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setShowContent(true);
      }, 300);
    } else {
      toast.success('Reflection complete! 💝');
      onClose?.();
    }
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'photo': return <Image className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'story': return <BookOpen className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
            Preparing your memory reflection...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!session) return null;

  const step = session.steps[currentStep];
  const progress = ((currentStep + 1) / session.steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950 z-50 overflow-y-auto">
      <div className="min-h-screen p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {session.session_title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Step {currentStep + 1} of {session.steps.length}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-full hover:bg-white/50"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content area */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <AnimatePresence mode="wait">
            {showContent && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl"
              >
                <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-2xl border-2 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-8">
                    {/* Media content */}
                    {step.media_content && (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                      >
                        {step.media_type === 'photo' && step.media_content.media_url && (
                          <div className="rounded-2xl overflow-hidden shadow-lg mb-4">
                            <img
                              src={step.media_content.media_url}
                              alt={step.media_content.title}
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}
                        {step.media_type === 'music' && (
                          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl mb-4">
                            <Music className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">
                                {step.media_content.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {step.media_content.artist}
                              </p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Reflection prompt */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                          {getMediaIcon(step.media_type)}
                        </div>
                        <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300 flex-1 select-none">
                          {step.content}
                        </p>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleNext}
            size="lg"
            className="min-h-[52px] px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg text-lg select-none"
          >
            {currentStep < session.steps.length - 1 ? (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              'Complete Reflection'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}