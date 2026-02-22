import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Users, Calendar, Lightbulb, Zap } from 'lucide-react';
import NameThatFace from '../components/games/NameThatFace';
import WhatDayIsIt from '../components/games/WhatDayIsIt';
import WordMemory from '../components/games/WordMemory';
import SequenceMemory from '../components/games/SequenceMemory';

export default function MemoryGamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Brain className="w-10 h-10 text-blue-600" />
            Memory Games
          </h1>
          <p className="text-gray-600 text-lg">
            Fun exercises to keep your mind sharp
          </p>
        </div>

        <Tabs defaultValue="faces" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faces" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Faces
            </TabsTrigger>
            <TabsTrigger value="orientation" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Orientation
            </TabsTrigger>
            <TabsTrigger value="words" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Words
            </TabsTrigger>
            <TabsTrigger value="sequence" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Sequence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faces" className="mt-6">
            <NameThatFace />
          </TabsContent>

          <TabsContent value="orientation" className="mt-6">
            <WhatDayIsIt />
          </TabsContent>

          <TabsContent value="words" className="mt-6">
            <WordMemory />
          </TabsContent>

          <TabsContent value="sequence" className="mt-6">
            <SequenceMemory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}