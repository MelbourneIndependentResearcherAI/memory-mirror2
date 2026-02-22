import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';

export default function WhatDayIsIt() {
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    { 
      question: 'What day is today?', 
      getAnswer: () => new Date().toLocaleDateString('en-US', { weekday: 'long' }) 
    },
    { 
      question: 'What month is it?', 
      getAnswer: () => new Date().toLocaleDateString('en-US', { month: 'long' }) 
    },
    { 
      question: 'What year is it?', 
      getAnswer: () => new Date().getFullYear().toString() 
    },
    { 
      question: 'What season is it?', 
      getAnswer: () => {
        const month = new Date().getMonth();
        const seasons = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
        return seasons[month];
      }
    },
  ];

  const [answers, setAnswers] = useState(Array(questions.length).fill(''));

  const handleSubmit = () => {
    const correctAnswer = questions[currentQuestion].getAnswer();
    if (answers[currentQuestion].toLowerCase() === correctAnswer.toLowerCase()) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameActive(false);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(Array(questions.length).fill(''));
    setGameActive(true);
  };

  if (!gameActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orientation Quiz Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold mb-4">
            Your Score: {score}/{questions.length}
          </p>
          <Button onClick={resetGame} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What Day Is It?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-2xl font-semibold">{questions[currentQuestion].question}</p>
          <Input
            type="text"
            value={answers[currentQuestion]}
            onChange={(e) => {
              const newAnswers = [...answers];
              newAnswers[currentQuestion] = e.target.value;
              setAnswers(newAnswers);
            }}
            placeholder="Your answer"
            className="text-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button onClick={handleSubmit} className="w-full" size="lg">
            Check Answer
          </Button>
          <p className="text-center text-gray-600">
            {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}