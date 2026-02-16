import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisualResponse({ suggestions, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!suggestions || suggestions.length === 0) return null;

  const current = suggestions[currentIndex];
  const isVideo = current.media_type === 'video';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % suggestions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-24 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-300 dark:border-blue-600 z-40"
    >
      <div className="relative">
        {/* Media Container */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <div className="relative w-full h-full">
              <video
                src={current.media_url}
                className="w-full h-full object-cover"
                controls
                autoPlay
                onClick={() => setIsPlaying(!isPlaying)}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
                  <Play className="w-16 h-16 text-white" />
                </div>
              )}
            </div>
          ) : (
            <img
              src={current.media_url}
              alt={current.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Navigation */}
        {suggestions.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full p-2 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full p-2 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5 text-slate-900 dark:text-white" />
            </button>
          </>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full p-2 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-900 dark:text-white" />
        </button>

        {/* Counter */}
        {suggestions.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {suggestions.length}
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
          {current.title}
        </h3>
        {current.caption && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {current.caption}
          </p>
        )}
        {current.emotional_context && (
          <div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-medium">
            {current.emotional_context.replace('_', ' ')}
          </div>
        )}
      </div>
    </motion.div>
  );
}