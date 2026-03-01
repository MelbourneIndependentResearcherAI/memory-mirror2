import React, { useState, useEffect } from 'react';
import { User, Heart, Music, Users, Book, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function UserProfileSetup({ onBack }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    loved_one_name: '',
    preferred_name: '',
    greeting_name: '',
    birth_year: '',
    interests: '',
    favorite_era: '1940s',
    life_experiences: '',
    favorite_music: '',
    important_people: '',
    communication_style: 'warm'
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setFormData({
        loved_one_name: profile.loved_one_name || '',
        preferred_name: profile.preferred_name || '',
        birth_year: profile.birth_year || '',
        interests: profile.interests?.join(', ') || '',
        favorite_era: profile.favorite_era || '1940s',
        life_experiences: profile.life_experiences?.map(exp => `${exp.title}: ${exp.description}`).join('\n') || '',
        favorite_music: profile.favorite_music?.join(', ') || '',
        important_people: profile.important_people?.map(p => `${p.name} (${p.relationship})`).join(', ') || '',
        communication_style: profile.communication_style || 'warm'
      });
    }
  }, [profiles]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const profileData = {
        ...data,
        interests: data.interests.split(',').map(i => i.trim()).filter(Boolean),
        favorite_music: data.favorite_music.split(',').map(m => m.trim()).filter(Boolean),
        life_experiences: data.life_experiences.split('\n').filter(Boolean).map(exp => {
          const [title, ...descParts] = exp.split(':');
          return {
            title: title.trim(),
            description: descParts.join(':').trim(),
            era: data.favorite_era
          };
        }),
        important_people: data.important_people.split(',').filter(Boolean).map(p => {
          const match = p.match(/(.+)\((.+)\)/);
          if (match) {
            return { name: match[1].trim(), relationship: match[2].trim() };
          }
          return { name: p.trim(), relationship: 'family' };
        }),
        birth_year: parseInt(data.birth_year) || null
      };

      if (profiles.length > 0) {
        return base44.entities.UserProfile.update(profiles[0].id, profileData);
      } else {
        return base44.entities.UserProfile.create(profileData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
      toast.success('Profile saved successfully! The AI will now personalize conversations.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };

  const completionFields = [
    formData.loved_one_name,
    formData.preferred_name,
    formData.birth_year,
    formData.interests,
    formData.life_experiences,
    formData.favorite_music,
    formData.important_people,
  ];
  const completionPercentage = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const displayName = formData.preferred_name || formData.loved_one_name;
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="min-h-[44px] min-w-[44px]">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Personalization Profile</h2>
          <p className="text-slate-600 dark:text-slate-400">Help the AI understand and connect with your loved one</p>
        </div>
      </div>

      {/* Profile header with avatar and completion progress */}
      <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-sm">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
            {displayName || 'New Profile'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Profile {completionPercentage}% complete
          </p>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-auto">
            <TabsTrigger value="basic" className="flex flex-col gap-1 py-2 min-h-[56px]">
              <User className="w-4 h-4" />
              <span className="text-xs">Basic Info</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex flex-col gap-1 py-2 min-h-[56px]">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="life" className="flex flex-col gap-1 py-2 min-h-[56px]">
              <Book className="w-4 h-4" />
              <span className="text-xs">Life Story</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex flex-col gap-1 py-2 min-h-[56px]">
              <Music className="w-4 h-4" />
              <span className="text-xs">Music &amp; People</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Their Name *</label>
                  <Input
                    required
                    placeholder="e.g., Margaret"
                    value={formData.loved_one_name}
                    onChange={(e) => setFormData({...formData, loved_one_name: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred Name</label>
                  <Input
                    placeholder="e.g., Maggie, Grandma"
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({...formData, preferred_name: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Birth Year</label>
                  <Input
                    type="number"
                    placeholder="e.g., 1945"
                    value={formData.birth_year}
                    onChange={(e) => setFormData({...formData, birth_year: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Personality &amp; Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Favorite Era</label>
                  <Select value={formData.favorite_era} onValueChange={(value) => setFormData({...formData, favorite_era: value})}>
                    <SelectTrigger className="min-h-[44px]">
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
                  <label className="text-sm font-medium mb-2 block">Communication Style</label>
                  <Select value={formData.communication_style} onValueChange={(value) => setFormData({...formData, communication_style: value})}>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal &amp; Respectful</SelectItem>
                      <SelectItem value="casual">Casual &amp; Friendly</SelectItem>
                      <SelectItem value="warm">Warm &amp; Affectionate</SelectItem>
                      <SelectItem value="gentle">Gentle &amp; Soothing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Interests &amp; Hobbies</label>
                  <Input
                    placeholder="e.g., gardening, knitting, reading, cooking (comma separated)"
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="min-h-[44px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="life">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" />
                  Life Experiences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Key Life Stories</label>
                  <Textarea
                    placeholder="One per line, format: Title: Description&#10;e.g., Navy Service: Served in the Navy 1963-1967&#10;Wedding Day: Married John in a small church ceremony"
                    value={formData.life_experiences}
                    onChange={(e) => setFormData({...formData, life_experiences: e.target.value})}
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Favorite Music
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Songs &amp; Artists</label>
                    <Input
                      placeholder="e.g., Frank Sinatra, Bing Crosby, Moon River (comma separated)"
                      value={formData.favorite_music}
                      onChange={(e) => setFormData({...formData, favorite_music: e.target.value})}
                      className="min-h-[44px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Important People
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Family &amp; Friends</label>
                    <Input
                      placeholder="e.g., John (husband), Sarah (daughter), Tom (son)"
                      value={formData.important_people}
                      onChange={(e) => setFormData({...formData, important_people: e.target.value})}
                      className="min-h-[44px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </form>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Their Name *</label>
                <Input
                  required
                  placeholder="e.g., Margaret"
                  value={formData.loved_one_name}
                  onChange={(e) => setFormData({...formData, loved_one_name: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Preferred Name</label>
                <Input
                  placeholder="e.g., Maggie, Grandma"
                  value={formData.preferred_name}
                  onChange={(e) => setFormData({...formData, preferred_name: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Birth Year</label>
                <Input
                  type="number"
                  placeholder="e.g., 1945"
                  value={formData.birth_year}
                  onChange={(e) => setFormData({...formData, birth_year: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Personality & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Favorite Era</label>
                <Select value={formData.favorite_era} onValueChange={(value) => setFormData({...formData, favorite_era: value})}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1940s">1940s</SelectItem>
                    <SelectItem value="1950s">1950s</SelectItem>
                    <SelectItem value="1960s">1960s</SelectItem>
                    <SelectItem value="1970s">1970s</SelectItem>
                    <SelectItem value="1980s">1980s</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Communication Style</label>
                <Select value={formData.communication_style} onValueChange={(value) => setFormData({...formData, communication_style: value})}>
                  <SelectTrigger className="min-h-[44px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal & Respectful</SelectItem>
                    <SelectItem value="casual">Casual & Friendly</SelectItem>
                    <SelectItem value="warm">Warm & Affectionate</SelectItem>
                    <SelectItem value="gentle">Gentle & Soothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Interests & Hobbies</label>
                <Input
                  placeholder="e.g., gardening, knitting, reading, cooking (comma separated)"
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5" />
              Life Experiences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Key Life Stories</label>
              <Textarea
                placeholder="One per line, format: Title: Description&#10;e.g., Navy Service: Served in the Navy 1963-1967&#10;Wedding Day: Married John in a small church ceremony"
                value={formData.life_experiences}
                onChange={(e) => setFormData({...formData, life_experiences: e.target.value})}
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Favorite Music
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Songs & Artists</label>
                <Input
                  placeholder="e.g., Frank Sinatra, Bing Crosby, Moon River (comma separated)"
                  value={formData.favorite_music}
                  onChange={(e) => setFormData({...formData, favorite_music: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Important People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Family & Friends</label>
                <Input
                  placeholder="e.g., John (husband), Sarah (daughter), Tom (son)"
                  value={formData.important_people}
                  onChange={(e) => setFormData({...formData, important_people: e.target.value})}
                  className="min-h-[44px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Button type="submit" className="w-full min-h-[48px] bg-blue-500 hover:bg-blue-600">
          Save Profile
        </Button>
      </form>
    </div>
  );
}