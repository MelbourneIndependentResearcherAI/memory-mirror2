import React from 'react';
import { Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SingAlongTrigger({ onTrigger }) {
  const singAlongKeywords = [
    'sing', 'song', 'nursery rhyme', 'lullaby', 'sing along', 
    'singalong', 'music', 'tune', 'melody', 'carol', 'hymn'
  ];

  const shouldShowSingAlong = (message) => {
    if (!message) return false;
    const lower = message.toLowerCase();
    return singAlongKeywords.some(keyword => lower.includes(keyword));
  };

  return {
    shouldShow: (message) => shouldShowSingAlong(message),
    trigger: onTrigger,
    button: (
      <Button
        onClick={onTrigger}
        className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="sm"
      >
        <Music2 className="w-4 h-4" />
        Sing Along
      </Button>
    )
  };
}