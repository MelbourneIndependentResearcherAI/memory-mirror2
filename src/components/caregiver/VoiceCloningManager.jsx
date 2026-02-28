import React, { useState } from 'react';
import { Upload, Mic, Play, Check, Trash2, Volume2, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const recordedChunksRef = React.useRef([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [cloningProgress, setCloningProgress] = useState(0);
  const [audioQuality, setAudioQuality] = useState(null);

  const { data: voiceProfiles = [], isLoading } = useQuery({
    queryKey: ['voiceProfiles'],
    queryFn: () => base44.entities.VoiceProfile.list('-created_date'),
  });

  const createVoiceMutation = useMutation({
    mutationFn: async (data) => {
      setCloningProgress(10);
      
      // Upload audio file first
      const uploadResult = await base44.integrations.Core.UploadFile({ file: data.audioFile });
      const audioUrl = uploadResult.file_url;
      setCloningProgress(30);

      // Clone voice
      const cloneResult = await base44.functions.invoke('cloneVoice', {
        audio_file_url: audioUrl,
        voice_name: data.voiceName,
        voice_description: data.relationship
      });
      setCloningProgress(70);

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

      // Determine quality rating (must match entity enum: excellent, good, fair, needs_improvement)
      let qualityRating = 'needs_improvement';
      if (audioQuality?.rating === 'excellent') qualityRating = 'excellent';
      else if (audioQuality?.rating === 'good') qualityRating = 'good';
      else if (audioQuality?.rating === 'fair') qualityRating = 'fair';

      setCloningProgress(90);

      // Create voice profile entity
      const result = await base44.entities.VoiceProfile.create({
        name: data.voiceName,
        relationship: data.relationship,
        voice_id: cloneResult.data.voice_id,
        audio_sample_url: audioUrl,
        sample_duration_seconds: Math.round(duration),
        is_active: false,
        quality_rating: qualityRating
      });
      
      setCloningProgress(100);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voiceProfiles'] });
      setSelectedFile(null);
      setVoiceName('');
      setRelationship('');
      setAudioQuality(null);
      setCloningProgress(0);
      toast.success('Voice cloned successfully!');
    },
    onError: (error) => {
      setCloningProgress(0);
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
      
      setRecordingDuration(0);
      const startTime = Date.now();
      const durationInterval = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
      recordedChunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        clearInterval(durationInterval);
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        setSelectedFile(file);
        analyzeAudioQuality(blob, Math.floor((Date.now() - startTime) / 1000));
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(100); // collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudioQuality = (blob, duration) => {
    // Analyze audio quality based on duration and file size
    const sizeMB = blob.size / (1024 * 1024);
    const quality = {
      duration: duration,
      fileSize: sizeMB.toFixed(2),
      rating: 'unknown'
    };

    if (duration < 60) {
      quality.rating = 'needs_improvement';
      quality.message = 'Too short - need at least 1 minute';
    } else if (duration >= 60 && duration < 120) {
      quality.rating = 'fair';
      quality.message = 'Fair quality - try to record 2+ minutes for better results';
    } else if (duration >= 120 && duration < 180) {
      quality.rating = 'good';
      quality.message = 'Good quality - meets minimum requirements';
    } else {
      quality.rating = 'excellent';
      quality.message = 'Excellent quality - optimal for cloning';
    }

    setAudioQuality(quality);
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
      
      // Analyze uploaded file
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audio.duration);
        analyzeAudioQuality(file, duration);
      });
      
      setSelectedFile(file);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      const response = await fetch(`/functions/synthesizeClonedVoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: "Hello, I'm here with you. How are you feeling today?",
          voice_id: voiceId
        })
      });

      if (!response.ok) {
        toast.error('Voice synthesis not available');
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch {
      toast.error('Failed to test voice');
    }
  };

  const getQualityColor = (rating) => {
    switch (rating) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'poor': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Voice Cloning Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">📋 Audio Requirements</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Duration:</strong> 1-5 minutes (longer = better quality)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Clarity:</strong> Clear speech in a quiet environment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Content:</strong> Natural conversation or reading (avoid music/noise)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span><strong>Format:</strong> MP3, WAV, M4A, or WebM (max 10MB)</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-300 dark:border-blue-700">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 Pro Tip:</strong> For best results, use a recording where the person speaks naturally and expressively. Family conversation recordings work great!
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clone a New Voice</CardTitle>
          <CardDescription>
            Upload or record high-quality audio to create a personalized AI voice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="space-y-3">
              <label className="text-sm font-medium block">Audio Sample *</label>
              
              {isRecording && (
                <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-700 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">
                      {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {recordingDuration < 60 ? 
                      `Keep talking... ${60 - recordingDuration}s until minimum` :
                      'Great! You can stop now or continue for better quality'
                    }
                  </p>
                  <Button
                    type="button"
                    onClick={stopRecording}
                    variant="outline"
                    size="lg"
                    className="min-h-[48px]"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Stop & Save Recording
                  </Button>
                </div>
              )}

              {!isRecording && !selectedFile && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={startRecording}
                    className="h-32 flex-col gap-2 border-2 border-dashed hover:border-blue-400 hover:bg-blue-50"
                  >
                    <Mic className="w-8 h-8 text-blue-600" />
                    <div className="text-center">
                      <p className="font-semibold">Record Now</p>
                      <p className="text-xs text-slate-500">Use microphone</p>
                    </div>
                  </Button>
                  
                  <label className="cursor-pointer">
                    <div className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all">
                      <Upload className="w-8 h-8 text-purple-600" />
                      <div className="text-center">
                        <p className="font-semibold">Upload File</p>
                        <p className="text-xs text-slate-500">Choose from device</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
              
              {selectedFile && !isRecording && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedFile.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFile(null);
                        setAudioQuality(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  {audioQuality && (
                    <div className={`p-3 rounded-lg border-2 ${getQualityColor(audioQuality.rating)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Quality Assessment</span>
                        <Badge className={getQualityColor(audioQuality.rating)}>
                          {audioQuality.rating.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{audioQuality.message}</p>
                      <div className="flex gap-4 text-xs">
                        <span>Duration: {formatDuration(audioQuality.duration)}</span>
                        <span>Size: {audioQuality.fileSize} MB</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {cloningProgress > 0 && cloningProgress < 100 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-600">Cloning in progress...</span>
                  <span className="font-semibold">{cloningProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${cloningProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
                  {cloningProgress < 30 ? 'Uploading audio...' :
                   cloningProgress < 70 ? 'Training AI model...' :
                   cloningProgress < 90 ? 'Finalizing voice profile...' :
                   'Almost done!'}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUploading || !selectedFile || !voiceName || audioQuality?.rating === 'poor'}
              className="w-full min-h-[50px] text-lg font-semibold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cloning Voice...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Clone Voice
                </>
              )}
            </Button>
            
            {audioQuality?.rating === 'poor' && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                Please record or upload audio that's at least 1 minute long
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Voice Profiles ({voiceProfiles.length})</h3>
          {voiceProfiles.some(p => p.is_active) && (
            <Badge className="bg-green-500 text-white">
              <Volume2 className="w-3 h-3 mr-1" />
              1 Active
            </Badge>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading voice profiles...</p>
          </div>
        ) : voiceProfiles.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Volume2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">No voice profiles yet</p>
              <p className="text-sm text-slate-500">Upload or record audio above to create your first voice clone</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {voiceProfiles.map(profile => {
              const qualityColor = getQualityColor(profile.quality_rating);
              
              return (
                <Card key={profile.id} className={profile.is_active ? 'border-2 border-green-500' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-full ${profile.is_active ? 'bg-green-100' : 'bg-blue-100'} dark:bg-slate-700 flex items-center justify-center text-2xl flex-shrink-0`}>
                        {profile.is_active ? '🎤' : '👤'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                            {profile.name}
                          </h4>
                          {profile.is_active && (
                            <Badge className="bg-green-500 text-white">
                              <Volume2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          )}
                          <Badge className={qualityColor}>
                            {profile.quality_rating}
                          </Badge>
                        </div>
                        
                        {profile.relationship && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {profile.relationship}
                          </p>
                        )}
                        
                        <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>📏 {formatDuration(profile.sample_duration_seconds)}</span>
                          <span>📅 {new Date(profile.created_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testVoice(profile.voice_id)}
                          className="min-h-[40px] min-w-[40px]"
                          title="Test voice"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        
                        {!profile.is_active && (
                          <Button
                            size="sm"
                            onClick={() => activateVoiceMutation.mutate(profile.id)}
                            className="bg-green-600 hover:bg-green-700 min-h-[40px]"
                            title="Activate voice"
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm(`Delete voice profile for ${profile.name}?`)) {
                              deleteVoiceMutation.mutate(profile.id);
                            }
                          }}
                          className="min-h-[40px] min-w-[40px]"
                          title="Delete voice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}