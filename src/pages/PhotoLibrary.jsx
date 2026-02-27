import React, { useState } from 'react';
import { ImagePlus, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function PhotoLibrary() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDetail, setShowDetail] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.list()
  });

  const currentPhoto = photos[selectedIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-amber-950 dark:to-yellow-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ImagePlus className="w-12 h-12 text-amber-600" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Photo Library</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300">Cherished memories in photos</p>
        </div>

        {/* Main Photo Display */}
        {currentPhoto ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-6"
          >
            <div className="relative bg-black">
              <img
                src={currentPhoto.media_url}
                alt={currentPhoto.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button
                  onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                  disabled={selectedIndex === 0}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 disabled:opacity-50"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  onClick={() => setSelectedIndex(Math.min(photos.length - 1, selectedIndex + 1))}
                  disabled={selectedIndex === photos.length - 1}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 disabled:opacity-50"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentPhoto.title}</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">{currentPhoto.caption}</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full">
                  {currentPhoto.era}
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                  By {currentPhoto.uploaded_by_name}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                {selectedIndex + 1} of {photos.length}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl">
            <p className="text-slate-600 dark:text-slate-400">No photos yet</p>
          </div>
        )}

        {/* Thumbnail Grid */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Photos</h3>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, idx) => (
              <motion.button
                key={photo.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedIndex(idx)}
                className={`relative rounded-lg overflow-hidden border-4 transition-all ${
                  selectedIndex === idx
                    ? 'border-amber-500 shadow-lg'
                    : 'border-slate-300 dark:border-slate-600 hover:border-amber-400'
                }`}
              >
                <img
                  src={photo.media_url}
                  alt={photo.title}
                  className="w-full h-20 object-cover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}