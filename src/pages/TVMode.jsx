import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import ChatInterface from '@/components/memory-mirror/ChatInterface';

export default function TVMode() {
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ['familyMedia'],
    queryFn: () => base44.entities.FamilyMedia.list()
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['tvConnections'],
    queryFn: () => base44.entities.TVConnection.list()
  });

  const activeConnection = connections.find(c => c.is_active);
  const textSize = activeConnection?.tv_settings?.text_size || 'extra-large';

  useEffect(() => {
    // Auto-enter fullscreen on load
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  const textSizeClasses = {
    'large': 'text-3xl',
    'extra-large': 'text-4xl',
    'huge': 'text-6xl'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      {/* TV Header */}
      <div className="bg-black/50 p-8 flex items-center justify-between">
        <div>
          <h1 className={`${textSizeClasses[textSize]} font-bold mb-2`}>
            Memory Mirror TV
          </h1>
          <p className="text-2xl text-white/80">
            Enjoy large-screen experience
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="outline"
            size="lg"
            className="min-h-[60px] min-w-[60px] bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
          </Button>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="lg"
            className="min-h-[60px] min-w-[60px] bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <Maximize2 className="w-8 h-8" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Photo Gallery */}
          {photos.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-4 border-white/20">
              <h2 className="text-4xl font-bold mb-6">Family Photos</h2>
              <div className="relative">
                <img
                  src={photos[currentIndex]?.url}
                  alt={photos[currentIndex]?.caption || 'Family photo'}
                  className="w-full h-96 object-contain rounded-2xl bg-black/30"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <Button
                    onClick={prevPhoto}
                    variant="outline"
                    size="lg"
                    className="min-h-[80px] min-w-[80px] bg-black/50 hover:bg-black/70 text-white border-white/30 rounded-full"
                  >
                    <ChevronLeft className="w-12 h-12" />
                  </Button>
                  <Button
                    onClick={nextPhoto}
                    variant="outline"
                    size="lg"
                    className="min-h-[80px] min-w-[80px] bg-black/50 hover:bg-black/70 text-white border-white/30 rounded-full"
                  >
                    <ChevronRight className="w-12 h-12" />
                  </Button>
                </div>
              </div>
              {photos[currentIndex]?.caption && (
                <p className="text-3xl text-center mt-6 text-white/90">
                  {photos[currentIndex].caption}
                </p>
              )}
            </div>
          )}

          {/* Chat Interface */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border-4 border-white/20">
            <h2 className="text-4xl font-bold mb-6">AI Companion</h2>
            <div style={{ transform: 'scale(1.2)', transformOrigin: 'top left' }}>
              <ChatInterface />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border-4 border-white/20">
          <h3 className="text-4xl font-bold mb-4">TV Controls</h3>
          <ul className="space-y-3 text-2xl">
            <li>✓ Use remote control arrows to navigate</li>
            <li>✓ Say "Hey Mirror" for voice activation</li>
            <li>✓ Press volume buttons for audio control</li>
            <li>✓ Enjoy photos and memories on the big screen</li>
          </ul>
        </div>
      </div>

      {/* TV Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 p-6 text-center">
        <p className="text-xl text-white/70">
          Memory Mirror TV Mode • Optimized for large screens • Voice-enabled
        </p>
      </div>
    </div>
  );
}