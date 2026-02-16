import React from 'react';
import { Image, Calendar, Users, MapPin, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartMemoryRecall({ memories, photos, onClose, onSelect }) {
  if (!memories?.length && !photos?.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
      >
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-4 border-amber-300 dark:border-amber-700 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <Image className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  💡 Relevant Memories
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              I found some memories that might bring comfort
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {photos?.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => onSelect && onSelect('photo', photo)}
                  className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 group"
                >
                  <div className="flex items-start gap-3">
                    {photo.media_url && (
                      <img
                        src={photo.media_url}
                        alt={photo.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                        📸 {photo.title}
                      </p>
                      {photo.caption && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-500">
                        {photo.era && (
                          <span className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded">
                            {photo.era}
                          </span>
                        )}
                        {photo.people_in_media?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {photo.people_in_media[0]}
                            {photo.people_in_media.length > 1 && ` +${photo.people_in_media.length - 1}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {memories?.map((memory) => (
                <button
                  key={memory.id}
                  onClick={() => onSelect && onSelect('memory', memory)}
                  className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 mb-1">
                        {memory.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
                        {memory.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        {memory.era && (
                          <span className="bg-purple-100 dark:bg-purple-900/50 px-2 py-0.5 rounded">
                            {memory.era}
                          </span>
                        )}
                        {memory.emotional_tone && (
                          <span className="capitalize">{memory.emotional_tone}</span>
                        )}
                        {memory.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {memory.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-amber-700 dark:text-amber-400 mt-3 text-center italic">
              Tap any memory to explore it together
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}