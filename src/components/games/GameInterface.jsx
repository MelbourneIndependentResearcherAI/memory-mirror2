import React, { useState } from 'react';
import { Brain, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { speakWithRealisticVoice } from '../memory-mirror/voiceUtils';

const games = [
  { id: 'ispy', name: 'I Spy', icon: '👁️', description: 'Fun guessing game' },
  { id: 'memory', name: 'Memory Match', icon: '🎴', description: 'Remember pairs' },
  { id: 'riddles', name: 'Riddles', icon: '🤔', description: 'Solve puzzles' },
  { id: 'story', name: 'Story Time', icon: '📖', description: 'Interactive stories' },
];

export default function GameInterface({ onClose }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startGame = async (gameId) => {
    setSelectedGame(gameId);
    setIsLoading(true);

    const prompts = {
      ispy: "You're playing 'I Spy' with someone who has dementia. Choose something simple and visible (colors, shapes, common objects). Start by saying 'I spy with my little eye, something that is...' Keep it fun, simple, and give gentle hints if they struggle. Be encouraging!",
      memory: "You're helping play a memory game. Describe 4 simple, familiar items (like apple, dog, sun, car). Ask them to remember them. After chatting briefly, gently ask what items they remember. Be encouraging even if they only remember one!",
      riddles: "Share a very simple, cheerful riddle appropriate for someone with dementia. Keep it about common things (animals, food, weather). Give lots of hints and be very encouraging. Example: 'I'm yellow and bright, I come out during the day. What am I?'",
      story: "Start an interactive story about a happy memory or adventure. Keep it simple, positive, and ask them to help decide what happens next. Use familiar settings like gardens, beaches, or family gatherings."
    };

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompts[gameId]}\n\nStart the game now with enthusiasm!`,
      });

      const gameMessage = typeof response === 'string' ? response : "Let's play together!";
      setGameState({ messages: [{ role: 'assistant', content: gameMessage }], gameId });
      speakWithRealisticVoice(gameMessage);

      // Log game activity
      base44.entities.ActivityLog.create({
        activity_type: 'game_played',
        details: { game: gameId, started: new Date().toISOString() }
      }).catch(() => {});

    } catch (error) {
      setGameState({ messages: [{ role: 'assistant', content: "Let's have some fun together!" }], gameId });
    }

    setIsLoading(false);
  };

  const handleGameResponse = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = userInput.trim();
    setUserInput('');
    setGameState(prev => ({
      ...prev,
      messages: [...prev.messages, { role: 'user', content: userMessage }]
    }));
    setIsLoading(true);

    try {
      const conversationContext = gameState.messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Continue the ${selectedGame} game. Be encouraging, warm, and patient.\n\n${conversationContext}\nuser: ${userMessage}\n\nRespond with enthusiasm and encouragement!`,
      });

      const gameResponse = typeof response === 'string' ? response : "That's wonderful! You're doing great!";
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: gameResponse }]
      }));
      speakWithRealisticVoice(gameResponse);

    } catch (error) {
      console.error('Game error:', error);
      const fallback = "You're doing wonderfully! Keep going!";
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: fallback }]
      }));
      speakWithRealisticVoice(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 dark:from-amber-950 dark:via-orange-950 dark:to-pink-950 p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] hover:bg-orange-200 dark:hover:bg-orange-800"
          >
            <X className="w-6 h-6" />
          </Button>
          <h2 className="text-2xl md:text-3xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
            <Brain className="w-6 h-6 md:w-8 md:h-8" />
            Brain Games
          </h2>
        </div>
      </div>

      {!selectedGame ? (
        <div className="grid grid-cols-2 gap-4">
          {games.map((game) => (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(game.id)}
              className="bg-gradient-to-br from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white p-6 rounded-2xl shadow-xl transition-all min-h-[140px] flex flex-col items-center justify-center gap-3"
            >
              <span className="text-5xl">{game.icon}</span>
              <div className="text-center">
                <div className="font-bold text-xl mb-1">{game.name}</div>
                <div className="text-sm opacity-90">{game.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 max-h-[300px] overflow-y-auto space-y-3">
            {gameState?.messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                } rounded-2xl p-4 shadow-lg`}
              >
                <p className="leading-relaxed">{msg.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGameResponse()}
              placeholder="Your answer..."
              className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-orange-300 dark:border-orange-700 rounded-full px-6 py-4 text-lg min-h-[56px] focus:outline-none focus:border-orange-500"
            />
            <Button
              onClick={handleGameResponse}
              disabled={isLoading || !userInput.trim()}
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 min-h-[56px] rounded-full"
            >
              <Play className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setSelectedGame(null);
              setGameState(null);
            }}
            className="w-full min-h-[44px]"
          >
            Choose Different Game
          </Button>
        </div>
      )}
    </div>
  );
}