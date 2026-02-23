import React, { useState, useRef } from 'react';
import { Upload, BookOpen, Music, Image, Video, Loader2, X, Save, Plus, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { saveToStore, STORES } from '@/components/utils/offlineStorage';

export default function ContentUploader() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [generatingAI, setGeneratingAI] = useState(false);

  // Fetch user profile for AI content generation
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles?.[0] || null;
    }
  });

  // Fetch existing stories and memories
  const { data: existingStories = [] } = useQuery({
    queryKey: ['stories'],
    queryFn: () => base44.entities.Story.list('-created_date', 10)
  });

  const { data: existingMemories = [] } = useQuery({
    queryKey: ['memories'],
    queryFn: () => base44.entities.Memory.list('-created_date', 10)
  });

  // Story state
  const [story, setStory] = useState({
    title: '',
    content: '',
    theme: 'family',
    era: 'any',
    mood: 'peaceful',
    length: 'short',
    narrator_note: ''
  });

  // Music state
  const [music, setMusic] = useState({
    title: '',
    artist: '',
    era: '1960s',
    genre: 'pop',
    mood: 'calm',
    personal_significance: ''
  });
  const musicFileRef = useRef(null);

  // Photo state
  const [photo, setPhoto] = useState({
    title: '',
    caption: '',
    era: 'present',
    people_in_media: ''
  });
  const photoFileRef = useRef(null);

  // Interactive Activity state
  const [activity, setActivity] = useState({
    title: '',
    content: '',
    type: 'trivia',
    difficulty: 'easy',
    answer: '',
    hints: ''
  });

  // Story upload mutation
  const storyMutation = useMutation({
    mutationFn: async () => {
      const created = await offlineEntities.create('Story', {
        ...story,
        uploaded_by_family: true
      });
      
      // Cache for offline access
      await saveToStore(STORES.stories, {
        ...created,
        offline_preloaded: false
      });
      
      return created;
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['stories'] });
      const previousStories = queryClient.getQueryData(['stories']);
      
      const optimisticStory = {
        id: `temp_${Date.now()}`,
        ...story,
        uploaded_by_family: true,
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['stories'], (old = []) => [...old, optimisticStory]);
      
      return { previousStories };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['stories'], context.previousStories);
      toast.error('Failed to upload story: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Story uploaded successfully!');
      setStory({
        title: '',
        content: '',
        theme: 'family',
        era: 'any',
        mood: 'peaceful',
        length: 'short',
        narrator_note: ''
      });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
    }
  });

  // Music upload mutation
  const musicMutation = useMutation({
    mutationFn: async (file) => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const created = await offlineEntities.create('Music', {
        ...music,
        youtube_url: uploadResult.file_url,
        uploaded_by_family: true
      });
      
      // Cache for offline access
      await saveToStore(STORES.music, {
        ...created,
        offline_preloaded: false
      });
      
      return created;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['music'] });
      const previousMusic = queryClient.getQueryData(['music']);
      
      const optimisticMusic = {
        id: `temp_${Date.now()}`,
        ...music,
        youtube_url: 'pending',
        uploaded_by_family: true,
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['music'], (old = []) => [...old, optimisticMusic]);
      
      return { previousMusic };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['music'], context.previousMusic);
      toast.error('Failed to upload music: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Music uploaded successfully!');
      setMusic({
        title: '',
        artist: '',
        era: '1960s',
        genre: 'pop',
        mood: 'calm',
        personal_significance: ''
      });
      if (musicFileRef.current) musicFileRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['music'] });
    }
  });

  // Photo upload mutation
  const photoMutation = useMutation({
    mutationFn: async (file) => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      const peopleArray = photo.people_in_media 
        ? photo.people_in_media.split(',').map(p => p.trim())
        : [];
      
      const created = await offlineEntities.create('FamilyMedia', {
        title: photo.title,
        caption: photo.caption,
        media_url: uploadResult.file_url,
        media_type: 'photo',
        era: photo.era,
        people_in_media: peopleArray
      });

      // Notify care team of new media upload
      try {
        const currentUser = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.list();
        const patientProfile = profiles?.[0];
        if (patientProfile?.id) {
          await base44.entities.CaregiverNotification.create({
            patient_profile_id: patientProfile.id,
            notification_type: 'new_media_upload',
            severity: 'low',
            title: 'New Photo Added',
            message: `${currentUser?.full_name || 'A caregiver'} uploaded "${photo.title}"`,
            data: {
              media_id: created.id,
              media_type: 'photo',
              uploaded_by: currentUser?.full_name
            },
            triggered_by: 'content_upload'
          });
        }
      } catch (err) {
        console.log('Team notification skipped:', err.message);
      }

      return created;
    },
    onMutate: async (file) => {
      await queryClient.cancelQueries({ queryKey: ['familyPhotos'] });
      const previousPhotos = queryClient.getQueryData(['familyPhotos']);
      
      const optimisticPhoto = {
        id: `temp_${Date.now()}`,
        title: photo.title,
        caption: photo.caption,
        media_url: URL.createObjectURL(file),
        media_type: 'photo',
        era: photo.era,
        created_date: new Date().toISOString()
      };
      
      queryClient.setQueryData(['familyPhotos'], (old = []) => [...old, optimisticPhoto]);
      
      return { previousPhotos };
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(['familyPhotos'], context.previousPhotos);
      toast.error('Failed to upload photo: ' + error.message);
    },
    onSuccess: () => {
      toast.success('Photo uploaded successfully!');
      setPhoto({
        title: '',
        caption: '',
        era: 'present',
        people_in_media: ''
      });
      if (photoFileRef.current) photoFileRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['familyPhotos'] });
    }
  });

  // Activity upload mutation
  const activityMutation = useMutation({
    mutationFn: async () => {
      const hintsArray = activity.hints 
        ? activity.hints.split(',').map(h => h.trim())
        : [];
      
      return await saveToStore(STORES.activityLog, {
        id: `custom_activity_${Date.now()}`,
        activity_type: 'memory_exercise',
        details: {
          ...activity,
          hints: hintsArray,
          id: `custom_${Date.now()}`,
          custom_uploaded: true
        },
        created_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Activity created successfully!');
      setActivity({
        title: '',
        content: '',
        type: 'trivia',
        difficulty: 'easy',
        answer: '',
        hints: ''
      });
    },
    onError: (error) => {
      toast.error('Failed to create activity: ' + error.message);
    }
  });

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    if (!story.title || !story.content) {
      toast.error('Please fill in title and content');
      return;
    }
    setUploading(true);
    try {
      await storyMutation.mutateAsync();
    } finally {
      setUploading(false);
    }
  };

  const handleMusicSubmit = async (e) => {
    e.preventDefault();
    const file = musicFileRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a music file');
      return;
    }
    if (!music.title) {
      toast.error('Please enter a song title');
      return;
    }
    setUploading(true);
    try {
      await musicMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    const file = photoFileRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a photo');
      return;
    }
    if (!photo.title) {
      toast.error('Please enter a photo title');
      return;
    }
    setUploading(true);
    try {
      await photoMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!activity.title || !activity.content) {
      toast.error('Please fill in title and content');
      return;
    }
    setUploading(true);
    try {
      await activityMutation.mutateAsync();
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }
    setGeneratingAI(true);
    try {
      const response = await base44.functions.invoke('generateAIContent', {
        type: 'story',
        userProfile,
        existingStories
      });
      if (response.data?.story) {
        setStory({
          title: response.data.story.title,
          content: response.data.story.content,
          theme: response.data.story.theme || 'family',
          era: 'any',
          mood: response.data.story.mood || 'peaceful',
          length: 'short',
          narrator_note: ''
        });
        toast.success('Story generated! Review and customize before uploading.');
      }
    } catch (error) {
      toast.error('Failed to generate story: ' + error.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleGeneratePrompts = async () => {
    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }
    setGeneratingAI(true);
    try {
      const response = await base44.functions.invoke('generateAIContent', {
        type: 'journal_prompt',
        userProfile,
        existingMemories
      });
      if (response.data?.prompts) {
        toast.success('Journal prompts generated! Copy to use.');
        const promptText = response.data.prompts.join('\n\n');
        navigator.clipboard.writeText(promptText);
      }
    } catch (error) {
      toast.error('Failed to generate prompts: ' + error.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Content Library Manager</h2>
        <p className="text-slate-600 dark:text-slate-400">Upload personalized stories, music, photos, and activities</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="story" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Stories
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photos
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Activities
          </TabsTrigger>
        </TabsList>

        {/* Story Upload */}
         <TabsContent value="story">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upload a Story</CardTitle>
                <CardDescription>Create personalized stories for meaningful engagement</CardDescription>
              </div>
              <Button
                type="button"
                onClick={handleGenerateStory}
                disabled={generatingAI || !userProfile}
                variant="outline"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {generatingAI ? 'Generating...' : 'Generate with AI'}
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStorySubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Story Title *</label>
                  <Input
                    placeholder="e.g., The Day We Met"
                    value={story.title}
                    onChange={(e) => setStory({...story, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Story Content *</label>
                  <Textarea
                    placeholder="Write your story here... Make it personal and meaningful."
                    value={story.content}
                    onChange={(e) => setStory({...story, content: e.target.value})}
                    rows={8}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Theme</label>
                    <Select value={story.theme} onValueChange={(val) => setStory({...story, theme: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friendship">Friendship</SelectItem>
                        <SelectItem value="nature">Nature</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="comfort">Comfort</SelectItem>
                        <SelectItem value="childhood">Childhood</SelectItem>
                        <SelectItem value="holidays">Holidays</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Era</label>
                    <Select value={story.era} onValueChange={(val) => setStory({...story, era: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any Era</SelectItem>
                        <SelectItem value="1940s">1940s</SelectItem>
                        <SelectItem value="1960s">1960s</SelectItem>
                        <SelectItem value="1980s">1980s</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Mood</label>
                    <Select value={story.mood} onValueChange={(val) => setStory({...story, mood: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="happy">Happy</SelectItem>
                        <SelectItem value="peaceful">Peaceful</SelectItem>
                        <SelectItem value="nostalgic">Nostalgic</SelectItem>
                        <SelectItem value="exciting">Exciting</SelectItem>
                        <SelectItem value="comforting">Comforting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Length</label>
                    <Select value={story.length} onValueChange={(val) => setStory({...story, length: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (1-2 min)</SelectItem>
                        <SelectItem value="medium">Medium (3-5 min)</SelectItem>
                        <SelectItem value="long">Long (5+ min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Narrator Note (Optional)</label>
                  <Input
                    placeholder="e.g., Read slowly with warm tone"
                    value={story.narrator_note}
                    onChange={(e) => setStory({...story, narrator_note: e.target.value})}
                  />
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Upload Story
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Music Upload */}
        <TabsContent value="music">
          <Card>
            <CardHeader>
              <CardTitle>Upload Music</CardTitle>
              <CardDescription>Add meaningful songs for memory and mood support</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMusicSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Song Title *</label>
                    <Input
                      placeholder="e.g., Our Wedding Song"
                      value={music.title}
                      onChange={(e) => setMusic({...music, title: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Artist</label>
                    <Input
                      placeholder="e.g., Frank Sinatra"
                      value={music.artist}
                      onChange={(e) => setMusic({...music, artist: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Era</label>
                    <Select value={music.era} onValueChange={(val) => setMusic({...music, era: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1940s">1940s</SelectItem>
                        <SelectItem value="1960s">1960s</SelectItem>
                        <SelectItem value="1980s">1980s</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <Select value={music.genre} onValueChange={(val) => setMusic({...music, genre: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="big_band">Big Band</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="folk">Folk</SelectItem>
                        <SelectItem value="disco">Disco</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select value={music.mood} onValueChange={(val) => setMusic({...music, mood: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uplifting">Uplifting</SelectItem>
                      <SelectItem value="calm">Calm</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="energetic">Energetic</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Personal Significance</label>
                  <Textarea
                    placeholder="Why is this song special? (e.g., 'We danced to this at our wedding')"
                    value={music.personal_significance}
                    onChange={(e) => setMusic({...music, personal_significance: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                  <Music className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Upload MP3, WAV, or other audio files
                  </p>
                  <input
                    ref={musicFileRef}
                    type="file"
                    accept="audio/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => musicFileRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Audio File
                  </Button>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Upload Music
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Upload */}
        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <CardTitle>Upload Photos</CardTitle>
              <CardDescription>Share cherished memories through photos</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhotoSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Photo Title *</label>
                  <Input
                    placeholder="e.g., Family Reunion 1968"
                    value={photo.title}
                    onChange={(e) => setPhoto({...photo, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Caption</label>
                  <Textarea
                    placeholder="Describe what's happening in this photo..."
                    value={photo.caption}
                    onChange={(e) => setPhoto({...photo, caption: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Era</label>
                    <Select value={photo.era} onValueChange={(val) => setPhoto({...photo, era: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1940s">1940s</SelectItem>
                        <SelectItem value="1960s">1960s</SelectItem>
                        <SelectItem value="1980s">1980s</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">People in Photo</label>
                    <Input
                      placeholder="Names separated by commas"
                      value={photo.people_in_media}
                      onChange={(e) => setPhoto({...photo, people_in_media: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center">
                  <Image className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Upload JPG, PNG, or other image files
                  </p>
                  <input
                    ref={photoFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => photoFileRef.current?.click()}
                    variant="outline"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Photo
                  </Button>
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Upload Photo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Creation */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Create Interactive Activity</CardTitle>
              <CardDescription>Design custom cognitive exercises and games</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActivitySubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Title *</label>
                  <Input
                    placeholder="e.g., Remember Our Vacation"
                    value={activity.title}
                    onChange={(e) => setActivity({...activity, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Activity Content *</label>
                  <Textarea
                    placeholder="The question or task... (e.g., 'Where did we go on vacation in 1975?')"
                    value={activity.content}
                    onChange={(e) => setActivity({...activity, content: e.target.value})}
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Activity Type</label>
                    <Select value={activity.type} onValueChange={(val) => setActivity({...activity, type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trivia">Trivia/Quiz</SelectItem>
                        <SelectItem value="association">Word Association</SelectItem>
                        <SelectItem value="memory">Memory Recall</SelectItem>
                        <SelectItem value="music_memory">Song/Music Memory</SelectItem>
                        <SelectItem value="creative">Creative Expression</SelectItem>
                        <SelectItem value="personal">Personal Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulty</label>
                    <Select value={activity.difficulty} onValueChange={(val) => setActivity({...activity, difficulty: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Challenging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Answer (Optional)</label>
                  <Input
                    placeholder="The correct answer if applicable"
                    value={activity.answer}
                    onChange={(e) => setActivity({...activity, answer: e.target.value})}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Hints (Optional)</label>
                  <Input
                    placeholder="Comma-separated hints (e.g., 'Think of the beach, Remember the sunshine')"
                    value={activity.hints}
                    onChange={(e) => setActivity({...activity, hints: e.target.value})}
                  />
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Create Activity
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}