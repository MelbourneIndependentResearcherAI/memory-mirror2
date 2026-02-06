import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookHeart, X, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { speakWithRealisticVoice } from './voiceUtils';

export default function MemoryGallery({ isOpen, onClose, filterEra = null }) {
  const [selectedMemory, setSelectedMemory] = useState(null);

  const { data: memories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date'),
  });

  const filteredMemories = filterEra 
    ? memories.filter(m => m.era === filterEra)
    : memories;

  const handlePlayMemory = (memory) => {
    const text = `${memory.title}. ${memory.description}`;
    speakWithRealisticVoice(text);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <BookHeart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <span>Memory Gallery</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {filteredMemories.map((memory) => (
            <Card 
              key={memory.id} 
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedMemory(memory)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{memory.title}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline">{memory.era}</Badge>
                  <Badge className="bg-pink-100 text-pink-800">{memory.emotional_tone}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {memory.image_url && (
                  <img 
                    src={memory.image_url} 
                    alt={memory.title} 
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-sm text-slate-600 line-clamp-3">{memory.description}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayMemory(memory);
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Listen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMemories.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BookHeart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No memories available yet</p>
          </div>
        )}

        {selectedMemory && (
          <Dialog open={!!selectedMemory} onOpenChange={() => setSelectedMemory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedMemory.title}</DialogTitle>
              </DialogHeader>
              {selectedMemory.image_url && (
                <img 
                  src={selectedMemory.image_url} 
                  alt={selectedMemory.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <p className="text-slate-700">{selectedMemory.description}</p>
              {selectedMemory.location && (
                <p className="text-sm text-slate-600">📍 {selectedMemory.location}</p>
              )}
              {selectedMemory.people_involved && selectedMemory.people_involved.length > 0 && (
                <p className="text-sm text-slate-600">👥 {selectedMemory.people_involved.join(', ')}</p>
              )}
              <Button onClick={() => handlePlayMemory(selectedMemory)}>
                <Play className="w-4 h-4 mr-2" />
                Listen to Memory
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}