import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function TVPhotoGalleryPage() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: photos = [] } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.list()
  });

  const nextPhoto = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 mx-auto min-h-[44px] text-lg"
          >
            <ArrowLeft className="w-6 h-6" />
            Back
          </button>
          <p className="text-white text-3xl">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-8">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 min-h-[44px] text-lg"
      >
        <ArrowLeft className="w-6 h-6" />
        Back
      </button>

      <div className="flex-1 flex items-center justify-center w-full max-w-5xl">
        <div className="relative w-full">
          <img
            src={photos[currentIndex]?.media_url}
            alt={photos[currentIndex]?.caption || 'Family photo'}
            className="w-full max-h-[70vh] object-contain rounded-2xl"
          />
          
          <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
            <button
              onClick={prevPhoto}
              className="pointer-events-auto p-4 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all min-h-[80px] min-w-[80px]"
            >
              <ChevronLeft className="w-12 h-12" />
            </button>
            <button
              onClick={nextPhoto}
              className="pointer-events-auto p-4 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all min-h-[80px] min-w-[80px]"
            >
              <ChevronRight className="w-12 h-12" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        {photos[currentIndex]?.caption && (
          <p className="text-white text-4xl font-semibold mb-4">
            {photos[currentIndex].caption}
          </p>
        )}
        <p className="text-slate-400 text-3xl">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}