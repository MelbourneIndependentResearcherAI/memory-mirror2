import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';

export default function NameThatFace() {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  const { data: photos = [] } = useQuery({
    queryKey: ['family-media'],
    queryFn: () => base44.entities.FamilyMedia.list('-created_date', 50)
  });

  const familyPhotos = photos.filter(p => p.media_type === 'photo' && p.people_in_media?.length > 0);

  const handleSubmit = () => {
    if (!familyPhotos[currentPhoto]) return;

    const correctNames = familyPhotos[currentPhoto].people_in_media || [];
    const isCorrect = correctNames.some(name => 
      answer.toLowerCase().includes(name.toLowerCase())
    );

    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentPhoto < familyPhotos.length - 1) {
      setCurrentPhoto(currentPhoto + 1);
      setAnswer('');
    } else {
      setGameActive(false);
    }
  };

  const resetGame = () => {
    setCurrentPhoto(0);
    setScore(0);
    setAnswer('');
    setGameActive(true);
  };

  if (familyPhotos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Name That Face</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 py-8">
            No family photos available. Ask your caregiver to upload some!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!gameActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Game Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold mb-4">
            Your Score: {score}/{familyPhotos.length}
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
        <CardTitle>Name That Face</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {familyPhotos[currentPhoto] && (
            <>
              <img
                src={familyPhotos[currentPhoto].media_url}
                alt="Family member"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Who is this person?"
                className="text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Answer
              </Button>
              <p className="text-center text-gray-600">
                {currentPhoto + 1} of {familyPhotos.length}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}