import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CareJournal({ onBack }) {
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['careJournals'],
    queryFn: async () => {
      // For now, we'll store journals as a custom entity
      // You may want to create a CareJournal entity
      const response = await fetch('/api/care-journals');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const createJournalMutation = useMutation({
    mutationFn: async (journalData) => {
      // Store journal entry - you can create a CareJournal entity for this
      const response = await fetch('/api/care-journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careJournals'] });
      setTitle('');
      setNotes('');
      setCurrentAudio(null);
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setCurrentAudio({ blob: audioBlob, url: audioUrl });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (currentAudio) {
      URL.revokeObjectURL(currentAudio.url);
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const uploadAndSaveJournal = async () => {
    if (!title.trim()) {
      alert('Please add a title for this journal entry');
      return;
    }

    setIsUploading(true);

    try {
      let audioUrl = null;

      if (currentAudio) {
        // Upload audio file
        const audioFile = new File([currentAudio.blob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        const uploadResult = await base44.integrations.Core.UploadFile({
          file: audioFile,
        });

        audioUrl = uploadResult.file_url;
      }

      await createJournalMutation.mutateAsync({
        title,
        notes,
        audio_url: audioUrl,
        created_date: new Date().toISOString(),
      });

      alert('Journal entry saved successfully!');
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Failed to save journal entry. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Care Journal</h2>
          <p className="text-slate-600 dark:text-slate-400">Record and document care observations</p>
        </div>
      </div>

      {/* New Entry Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📖 New Journal Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Entry Title *
            </label>
            <Input
              placeholder="e.g., Morning routine observation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Written Notes
            </label>
            <Textarea
              placeholder="Add observations, behaviors, or important details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Audio Recording Section */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6">
            <div className="text-center">
              <Mic className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                Audio Recording
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Record your observations for later review
              </p>

              {!currentAudio && !isRecording && (
                <Button
                  onClick={startRecording}
                  className="bg-red-500 hover:bg-red-600 text-white min-h-[44px] px-6"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-2xl font-mono text-slate-800 dark:text-slate-100">
                      {formatTime(recordingTime)}
                    </span>
                  </div>
                  <Button
                    onClick={stopRecording}
                    variant="outline"
                    className="min-h-[44px] px-6"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}

              {currentAudio && (
                <div className="space-y-4">
                  <audio
                    ref={audioRef}
                    src={currentAudio.url}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={playAudio}
                        variant="outline"
                        size="icon"
                        className="min-h-[44px] min-w-[44px]"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        Recording ready
                      </span>
                      <Button
                        onClick={deleteRecording}
                        variant="ghost"
                        size="icon"
                        className="min-h-[44px] min-w-[44px] text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={startRecording}
                    variant="outline"
                    className="min-h-[44px]"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Record Again
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={uploadAndSaveJournal}
            disabled={isUploading || !title.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white min-h-[48px]"
          >
            {isUploading ? (
              <>
                <Upload className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Save Journal Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-slate-500 py-8">Loading entries...</p>
          ) : journals.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              No journal entries yet. Create your first entry above.
            </p>
          ) : (
            <div className="space-y-4">
              {journals.map((journal, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {journal.title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {new Date(journal.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  {journal.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {journal.notes}
                    </p>
                  )}
                  {journal.audio_url && (
                    <audio
                      controls
                      src={journal.audio_url}
                      className="w-full h-10"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}