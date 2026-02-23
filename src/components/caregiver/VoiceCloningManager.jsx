import React, { useState } from 'react';
import { Upload, Mic, Play, Check, AlertCircle, Trash2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function VoiceCloningManager() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [voiceName, setVoiceName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const { data: voiceProfiles = [], isLoading } = useQuery({
    queryKey: ['voiceProfiles'],
    queryFn: () => base44.entities.VoiceProfile.list('-created_date'),
  });

  const createVoiceMutation = useMutation({
    mutationFn: async (data) => {
      // Upload audio file first
      const uploadResult = await base44.integrations.Core.UploadFile({ file: data.audioFile });
      const audioUrl = uploadResult.file_url;

      // Clone voice
      const cloneResult = await base44.functions.invoke('cloneVoice', {
        audio_file_url: audioUrl,
        voice_name: data.voiceName,
        voice_description: data.relationship
      });

      if (!cloneResult.data.success) {
        throw new Error(cloneResult.data.error || 'Voice cloning failed');
      }

      // Get audio duration
      const audio = new Audio(URL.createObjectURL(data.audioFile));
      const duration = await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
      });

      // Create voice profile entity
      return base44.entities.VoiceProfile.create({
        name: data.voiceName,
        relationship: data.relationship,
        voice_id: cloneResult.data.voice_id,
        audio_sample_url: audioUrl,
        sample_duration_seconds: Math.round(duration),
        is_active: false,
        quality_rating: 'good'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceProfiles'] });
      setSelectedFile(null);
      setVoiceName('');
      setRelationship('');
      toast.success('Voice cloned successfully!');
    },
    onError: (error) => {
      if (error.message.includes('API key not configured')) {
        toast.error('Voice cloning requires ElevenLabs API key. Contact admin to configure ELEVENLABS_API_KEY secret.');
      } else {
        toast.error(error.message || 'Failed to clone voice');
      }
    }
  });

  const activateVoiceMutation = useMutation({
    mutationFn: async (voiceId) => {
      // Deactivate all voices first
      const profiles = await base44.entities.VoiceProfile.list();
      await Promise.all(
        profiles.map(p => 
          base44.entities.VoiceProfile.update(p.id, { is_active: false })
        )
      );
      
      // Activate selected voice
      return base44.entities.VoiceProfile.update(voiceId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceProfiles'] });
      toast.success('Voice activated');
    }
  });

  const deleteVoiceMutation = useMutation({
    mutationFn: (voiceId) => base44.entities.VoiceProfile.delete(voiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceProfiles'] });
      toast.success('Voice profile deleted');
    }
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordedChunks([]);
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('audio')) {
        toast.error('Please select an audio file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large. Maximum size is 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile || !voiceName) {
      toast.error('Please provide voice name and audio sample');
      return;
    }

    setIsUploading(true);
    try {
      await createVoiceMutation.mutateAsync({
        audioFile: selectedFile,
        voiceName,
        relationship
      });
    } finally {
      setIsUploading(false);
    }
  };

  const testVoice = async (voiceId) => {
    try {
      const result = await base44.functions.invoke('synthesizeClonedVoice', {
        text: "Hello, I'm here with you. How are you feeling today?",
        voice_id: voiceId
      });

      if (result.data.fallback) {
        toast.error('Voice synthesis not available');
        return;
      }

      const audio = new Audio(URL.createObjectURL(new Blob([result.data])));
      audio.play();
    } catch (error) {
      toast.error('Failed to test voice');
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Upload 1-5 minutes of clear audio from a family member. The AI will learn to speak in their voice for more personalized comfort.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Clone a New Voice</CardTitle>
          <CardDescription>
            Record or upload audio of someone speaking clearly for at least 1 minute
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Name</label>
              <Input
                placeholder="e.g., Mom, Daughter Sarah"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship</label>
              <Input
                placeholder="e.g., Mother, Daughter, Son"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Audio Sample</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex-1"
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
                  {isRecording ? 'Stop Recording' : 'Record Audio'}
                </Button>
                
                <label className="flex-1">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              
              {selectedFile && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  {selectedFile.name} selected
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !voiceName}
              className="w-full"
            >
              {isUploading ? 'Cloning Voice...' : 'Clone Voice'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Voice Profiles</h3>
        
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : voiceProfiles.length === 0 ? (
          <p className="text-sm text-slate-500">No voice profiles yet. Create one above!</p>
        ) : (
          voiceProfiles.map(profile => (
            <Card key={profile.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{profile.name}</h4>
                      {profile.is_active && (
                        <Badge className="bg-green-500">Active</Badge>
                      )}
                    </div>
                    
                    {profile.relationship && (
                      <p className="text-sm text-slate-600 mb-2">{profile.relationship}</p>
                    )}
                    
                    <p className="text-xs text-slate-500">
                      Sample duration: {profile.sample_duration_seconds}s
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testVoice(profile.voice_id)}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                    
                    {!profile.is_active && (
                      <Button
                        size="sm"
                        onClick={() => activateVoiceMutation.mutate(profile.id)}
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Activate
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Delete this voice profile?')) {
                          deleteVoiceMutation.mutate(profile.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}