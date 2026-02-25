import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Trophy, Brain, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NameThatFace from '../components/games/NameThatFace';
import WordMemory from '../components/games/WordMemory';
import SequenceMemory from '../components/games/SequenceMemory';
import WhatDayIsIt from '../components/games/WhatDayIsIt';

const games = [
  {
    id: 'name-that-face',
    title: 'Name That Face',
    description: 'Match family photos with their names',
    icon: '👨‍👩‍👧‍👦',
    difficulty: 'Easy',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'word-memory',
    title: 'Word Memory',
    description: 'Remember and recall simple word lists',
    icon: '📝',
    difficulty: 'Medium',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'sequence-memory',
    title: 'Sequence Memory',
    description: 'Follow and repeat visual patterns',
    icon: '🔢',
    difficulty: 'Medium',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'what-day-is-it',
    title: 'What Day Is It?',
    description: 'Practice date and time awareness',
    icon: '📅',
    difficulty: 'Easy',
    color: 'from-green-500 to-emerald-500'
  }
];

const GAME_COMPONENTS = {
  'name-that-face': NameThatFace,
  'word-memory': WordMemory,
  'sequence-memory': SequenceMemory,
  'what-day-is-it': WhatDayIsIt,
};

export default function MemoryGames() {
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  if (selectedGame) {
    const GameComponent = GAME_COMPONENTS[selectedGame];
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-4">
        <Button
          onClick={() => setSelectedGame(null)}
          variant="outline"
          className="mb-4 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
        {GameComponent ? <GameComponent /> : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-purple-950 dark:to-pink-950 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <Gamepad2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Memory Games
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Fun, engaging activities designed to gently exercise memory and cognitive function
          </p>
        </div>

        {/* Benefits Card */}
        <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Brain className="w-8 h-8 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Why Memory Games Matter
                </h2>
                <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Provide sense of achievement and confidence
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Gentle cognitive stimulation without frustration
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Fun, low-pressure activities
                  </li>
                  <li className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Track progress over time
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game) => (
            <Card
              key={game.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-purple-300 dark:hover:border-purple-700"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className={`h-3 bg-gradient-to-r ${game.color}`} />
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{game.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{game.title}</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {game.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold">
                    {game.difficulty}
                  </span>
                  <Button
                    className={`bg-gradient-to-r ${game.color} hover:opacity-90 min-h-[44px]`}
                  >
                    Play Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Designed for Dementia Care
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              All games are designed with dementia care principles: large buttons, clear instructions, 
              positive reinforcement, and no time pressure. Progress is celebrated, mistakes are never 
              highlighted. Just gentle, joyful engagement.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
            className="min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}