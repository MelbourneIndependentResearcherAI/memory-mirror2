import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';

export default function WordMemory() {
  const [gamePhase, setGamePhase] = useState('start');
  const [score, setScore] = useState(0);
  const [wordsShown, setWordsShown] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);

  const words = ['Apple', 'Piano', 'Mountain', 'Butterfly', 'Treasure'];

  useEffect(() => {
    if (gamePhase === 'viewing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'viewing' && timeLeft === 0) {
      setGamePhase('guessing');
    }
  }, [gamePhase, timeLeft]);

  const startGame = () => {
    setWordsShown(words);
    setGamePhase('viewing');
    setTimeLeft(10);
  };

  const handleGuess = (index, value) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  const submitGuesses = () => {
    let correct = 0;
    guesses.forEach((guess, i) => {
      if (guess.toLowerCase() === words[i].toLowerCase()) {
        correct++;
      }
    });
    setScore(correct);
    setGamePhase('complete');
  };

  const resetGame = () => {
    setGamePhase('start');
    setScore(0);
    setGuesses([]);
  };

  if (gamePhase === 'start') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Word Memory Game</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-lg mb-4">Remember 5 words for 10 seconds</p>
          <Button onClick={startGame} className="w-full" size="lg">
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'viewing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Remember these words:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-6xl font-bold text-center text-blue-600 py-8">
              {timeLeft}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {wordsShown.map((word, i) => (
                <div key={i} className="bg-blue-100 p-4 rounded-lg text-center text-xl font-semibold">
                  {word}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gamePhase === 'guessing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recall the Words</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Input
                key={i}
                type="text"
                value={guesses[i] || ''}
                onChange={(e) => handleGuess(i, e.target.value)}
                placeholder={`Word ${i + 1}`}
                className="text-lg"
              />
            ))}
            <Button onClick={submitGuesses} className="w-full" size="lg">
              Submit Answers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Complete! 🎉</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-semibold mb-4">You remembered {score}/5 words!</p>
        <Button onClick={resetGame} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </CardContent>
    </Card>
  );
}