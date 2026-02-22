import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SequenceMemory() {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [colors] = useState(['red', 'green', 'yellow', 'blue']);
  const [level, setLevel] = useState(0);
  const [showingSequence, setShowingSequence] = useState(false);

  const colorMap = {
    red: 'bg-red-500 hover:bg-red-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
  };

  const startGame = () => {
    const newSequence = [Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setGameActive(true);
    setLevel(1);
    playSequence(newSequence);
  };

  const playSequence = async (seq) => {
    setShowingSequence(true);
    setGameActive(false);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      flashColor(seq[i]);
    }
    setShowingSequence(false);
    setGameActive(true);
  };

  const flashColor = (colorIndex) => {
    const element = document.getElementById(`color-${colorIndex}`);
    if (element) {
      element.classList.add('ring-4', 'ring-white', 'scale-110');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-white', 'scale-110');
      }, 300);
    }
  };

  const handleColorClick = async (colorIndex) => {
    if (!gameActive || showingSequence) return;

    flashColor(colorIndex);
    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameActive(false);
      alert(`Game Over! You reached level ${level}`);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newSequence = [...sequence, Math.floor(Math.random() * 4)];
      setSequence(newSequence);
      setPlayerSequence([]);
      setLevel(level + 1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      playSequence(newSequence);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence Memory (Simon Says)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-center text-lg font-semibold">Level: {level}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {colors.map((color, i) => (
              <button
                key={i}
                id={`color-${i}`}
                onClick={() => handleColorClick(i)}
                disabled={!gameActive || showingSequence}
                className={`w-24 h-24 rounded-lg ${colorMap[color]} transition-all disabled:opacity-50`}
              />
            ))}
          </div>
          {!gameActive && level === 0 && (
            <Button onClick={startGame} className="w-full" size="lg">
              Start Game
            </Button>
          )}
          {showingSequence && (
            <p className="text-center text-gray-600">Watch the sequence...</p>
          )}
          {gameActive && !showingSequence && (
            <p className="text-center text-gray-600">Your turn! Repeat the sequence</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}