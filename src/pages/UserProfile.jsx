import { useState, useEffect } from 'react';
import { ArrowLeft, User, Heart, Music, Users, Book, Edit2, Check, Save, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { User, Heart, Music, Users, Book, Edit2, Save, X, ArrowLeft, Calendar, Star, Clock, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User, Heart, Music, Users, Book, Edit2, Check, X, ArrowLeft, Calendar, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ERA_LABELS = {
  '1940s': '1940s Era',
  '1960s': '1960s Era',
  '1980s': '1980s Era',
  present: 'Present Day',
};

const ERA_COLORS = {
  '1940s': 'from-amber-400 to-orange-400',
  '1960s': 'from-orange-400 to-pink-400',
  '1980s': 'from-purple-400 to-pink-400',
  'present': 'from-blue-400 to-cyan-400',
};


  '1980s': 'from-purple-400 to-fuchsia-400',
  present: 'from-blue-400 to-cyan-400',
};

const STYLE_LABELS = {
  formal: 'Formal & Respectful',
  casual: 'Casual & Friendly',
  warm: 'Warm & Affectionate',
  gentle: 'Gentle & Soothing',
};

const TABS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'personality', label: 'Personality', icon: Heart },
  { id: 'life', label: 'Life Stories', icon: Book },
  { id: 'connections', label: 'Music & People', icon: Users },
];

function ProfileAvatar({ name, era }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : '??';
  const gradient = ERA_COLORS[era] || ERA_COLORS.present;
  return (
    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-700`}>
      <span className="text-white text-3xl font-bold">{initials}</span>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400 sm:w-36 flex-shrink-0">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-200">
        {value || <span className="italic text-slate-400">Not set</span>}
      </span>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    loved_one_name: '',
    preferred_name: '',
    birth_year: '',
    interests: '',
    favorite_era: '1940s',
    life_experiences: '',
    favorite_music: '',
    important_people: '',
    communication_style: 'warm',
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['userProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const profile = profiles[0] || null;

  const populateForm = (p) => {
    setFormData({
      loved_one_name: p.loved_one_name || '',
      preferred_name: p.preferred_name || '',
      birth_year: p.birth_year || '',
      interests: p.interests?.join(', ') || '',
      favorite_era: p.favorite_era || '1940s',
      life_experiences:
        p.life_experiences
          ?.map((exp) => `${exp.title}: ${exp.description}`)
          .join('\n') || '',
      favorite_music: p.favorite_music?.join(', ') || '',
      important_people:
        p.important_people
          ?.map((per) => `${per.name} (${per.relationship})`)
          .join(', ') || '',
      communication_style: p.communication_style || 'warm',
    });
  };

  useEffect(() => {
    if (profile) populateForm(profile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleStartEdit = () => {
    if (profile) populateForm(profile);
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const profileData = {
        ...data,
        interests: data.interests.split(',').map((i) => i.trim()).filter(Boolean),
        favorite_music: data.favorite_music.split(',').map((m) => m.trim()).filter(Boolean),
        life_experiences: data.life_experiences
          .split('\n')
          .filter(Boolean)
          .map((exp) => {
            const [title, ...descParts] = exp.split(':');
            return {
              title: title.trim(),
              description: descParts.join(':').trim(),
              era: data.favorite_era,
            };
          }),
        important_people: data.important_people
          .split(',')
          .filter(Boolean)
          .map((p) => {
            const match = p.match(/(.+)\((.+)\)/);
            if (match) return { name: match[1].trim(), relationship: match[2].trim() };
            return { name: p.trim(), relationship: 'family' };
          }),
        birth_year: parseInt(data.birth_year) || null,
      };
      if (profile) return base44.entities.UserProfile.update(profile.id, profileData);
      return base44.entities.UserProfile.create(profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfiles'] });
      setIsEditing(false);
    },
  });

  const eraGradient = ERA_COLORS[profile?.favorite_era || 'present'];

  const displayName = profile?.preferred_name || profile?.loved_one_name || 'No Profile';
  const age = profile?.birth_year
    ? new Date().getFullYear() - profile.birth_year
    : null;

  const handleSave = (e) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
  });

  const eraGradient = ERA_COLORS[profile?.favorite_era || 'present'];
  const displayName = profile?.preferred_name || profile?.loved_one_name || 'No Profile';
  const age = profile?.birth_year ? new Date().getFullYear() - profile.birth_year : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    saveProfileMutation.mutate(formData);
  };

  const field = (key) => ({
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      {/* Header bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">User Profile</h1>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEdit}
            className="gap-2 min-h-[44px]"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="gap-2 min-h-[44px] text-slate-500"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero card */}
        <div
          className={`rounded-2xl bg-gradient-to-br ${ERA_COLORS[profile?.favorite_era || 'present']} p-6 shadow-xl flex items-center gap-6`}
        >
          <ProfileAvatar
            name={profile?.loved_one_name || '?'}
            era={profile?.favorite_era || 'present'}
          />
          <div className="flex-1 text-white">
            <h2 className="text-3xl font-bold leading-tight">
              {profile?.loved_one_name || 'No profile yet'}
            </h2>
            {profile?.preferred_name && (
              <p className="text-white/80 text-lg">"{profile.preferred_name}"</p>
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
      {/* Header Banner */}
      <div className={`bg-gradient-to-r ${eraGradient} text-white`}>
        <div className="max-w-3xl mx-auto px-4 pt-4 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 min-h-[44px] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="flex items-center gap-5">
            <ProfileAvatar name={profile?.loved_one_name || '?'} era={profile?.favorite_era || 'present'} />

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{displayName}</h1>
              {profile?.loved_one_name && profile?.preferred_name && profile.loved_one_name !== profile.preferred_name && (
                <p className="text-white/80 text-sm mt-0.5">Full name: {profile.loved_one_name}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {age && (
                  <span className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                    <Calendar className="w-3.5 h-3.5" />{age} years old
                  </span>
                )}
                {profile?.favorite_era && (
                  <span className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                    <Clock className="w-3.5 h-3.5" />{ERA_LABELS[profile.favorite_era]}
                  </span>
                )}
                {profile?.communication_style && (
                  <span className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
                    <Star className="w-3.5 h-3.5" />{STYLE_LABELS[profile.communication_style]}
                  </span>
                )}
              </div>
            </div>

            {!isEditing ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleStartEdit}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-shrink-0 min-h-[44px] gap-2"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelEdit}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-shrink-0 min-h-[44px] gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 mt-4">
        {!isEditing ? (
          <>
            {!profile && (
              <Card className="text-center py-10 mb-4">
                <CardContent>
                  <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 dark:text-slate-400 mb-4">No profile has been created yet.</p>
                  <Button onClick={handleStartEdit} className="bg-blue-500 hover:bg-blue-600 gap-2">
                    <Edit2 className="w-4 h-4" /> Create Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            {profile && (
              <>
                {/* Tab Navigation */}
                <div className="flex gap-1 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm mb-4 overflow-x-auto">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center min-h-[44px] ${
                          activeTab === tab.id
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="w-5 h-5 text-blue-500" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <ProfileField label="Full Name" value={profile.loved_one_name} />
                      <ProfileField label="Preferred Name" value={profile.preferred_name} />
                      <ProfileField label="Birth Year" value={profile.birth_year} />
                      <ProfileField label="Age" value={age ? `${age} years old` : null} />
                    </CardContent>
                  </Card>
                )}

                {/* Personality Tab */}
                {activeTab === 'personality' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Heart className="w-5 h-5 text-pink-500" />
                        Personality &amp; Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ProfileField
                        label="Favourite Era"
                        value={profile.favorite_era ? ERA_LABELS[profile.favorite_era] : null}
                      />
                      <ProfileField
                        label="Communication Style"
                        value={profile.communication_style ? STYLE_LABELS[profile.communication_style] : null}
                      />
                      {profile.interests?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                            Interests &amp; Hobbies
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {profile.interests.map((interest, i) => (
                              <Badge key={i} variant="secondary" className="text-sm">{interest}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Life Stories Tab */}
                {activeTab === 'life' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Book className="w-5 h-5 text-green-500" />
                        Life Experiences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.life_experiences?.length > 0 ? (
                        <div className="space-y-3">
                          {profile.life_experiences.map((exp, i) => (
                            <div key={i} className="border-l-4 border-amber-300 pl-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-r-lg">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{exp.title}</p>
                              {exp.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                      No life experiences recorded yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Music className="w-5 h-5 text-orange-500" />
                      Favorite Music
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                          Songs & Artists
                        </label>
                        <Input
                          placeholder="e.g., Frank Sinatra, Bing Crosby, Moon River (comma separated)"
                          value={formData.favorite_music}
                          onChange={(e) =>
                            setFormData({ ...formData, favorite_music: e.target.value })
                          }
                          className="min-h-[44px]"
                        />
                      </div>
                    ) : profile?.favorite_music?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.favorite_music.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-sm">
                            🎵 {item}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                        No favorite music recorded yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {profile && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="w-5 h-5 text-rose-500" />
                      Interests &amp; Hobbies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InfoChips items={profile.interests} />
                  </CardContent>
                </Card>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                          No life experiences recorded yet.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Music & People Tab */}
                {activeTab === 'connections' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Music className="w-5 h-5 text-orange-500" />
                          Favourite Music
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profile.favorite_music?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {profile.favorite_music.map((item, i) => (
                              <Badge key={i} variant="secondary" className="text-sm">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                            No favourite music recorded yet.
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-sm">Not set</p>
                    )}
                  </CardContent>
                </Card>


                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="w-5 h-5 text-green-500" />
                      Important People
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editing ? (
                      <div>
                        <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                          Family & Friends
                        </label>
                        <Input
                          placeholder="e.g., John (husband), Sarah (daughter), Tom (son)"
                          value={formData.important_people}
                          onChange={(e) =>
                            setFormData({ ...formData, important_people: e.target.value })
                          }
                          className="min-h-[44px]"
                        />
                      </div>
                    ) : profile?.important_people?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {profile.important_people.map((person, i) => (
                          <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-700 dark:text-green-300 text-xs font-bold">
                                {person.name?.slice(0, 1).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{person.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{person.relationship}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      {profile && profile.important_people && profile.important_people.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {profile.important_people.map((person, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-700 dark:text-green-300 text-xs font-bold">
                                  {(person.name || '').slice(0, 1).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{person.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{person.relationship}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                          No important people recorded yet.
                        </p>
                      )}
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Save Button (edit mode only) */}
            {editing && (
              <div className="mt-4">
                <Button
                  onClick={() => saveProfileMutation.mutate(formData)}
                  disabled={saveProfileMutation.isPending}
                  className="w-full min-h-[48px] bg-blue-500 hover:bg-blue-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveProfileMutation.isPending ? 'Saving…' : 'Save Profile'}
                </Button>
              </div>
            )}
          </>
                      <p className="text-slate-400 italic text-sm">Not set</p>
                    )}
                  </CardContent>
                </Card>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Users className="w-5 h-5 text-blue-500" />
                          Important People
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {profile.important_people?.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {profile.important_people.map((person, i) => (
                              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-700 dark:text-blue-300 text-xs font-bold">
                                    {person.name?.slice(0, 1).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{person.name}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{person.relationship}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                            No important people recorded yet.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Their Name *</label>
                  <Input required placeholder="e.g., Margaret" className="min-h-[44px]" {...field('loved_one_name')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Preferred Name</label>
                  <Input placeholder="e.g., Maggie, Grandma" className="min-h-[44px]" {...field('preferred_name')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Birth Year</label>
                  <Input type="number" placeholder="e.g., 1945" className="min-h-[44px]" {...field('birth_year')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="w-5 h-5" />
                  Personality &amp; Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Favourite Era</label>
                  <Select value={formData.favorite_era} onValueChange={(v) => setFormData({ ...formData, favorite_era: v })}>
                    <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
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
                  <Select value={formData.communication_style} onValueChange={(v) => setFormData({ ...formData, communication_style: v })}>
                    <SelectTrigger className="min-h-[44px]"><SelectValue /></SelectTrigger>
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
                  <Input placeholder="e.g., gardening, knitting, reading (comma separated)" className="min-h-[44px]" {...field('interests')} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Book className="w-5 h-5" />
                  Life Experiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <label className="text-sm font-medium mb-2 block">Key Life Stories</label>
                <Textarea
                  placeholder="One per line, format: Title: Description&#10;e.g., Navy Service: Served 1963-1967"
                  rows={5}
                  {...field('life_experiences')}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Music className="w-5 h-5" />
                  Favourite Music
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="e.g., Frank Sinatra, Moon River (comma separated)" className="min-h-[44px]" {...field('favorite_music')} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-5 h-5" />
                  Important People
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="e.g., John (husband), Sarah (daughter)" className="min-h-[44px]" {...field('important_people')} />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 min-h-[48px] gap-2 bg-blue-500 hover:bg-blue-600"
                disabled={saveProfileMutation.isPending}
              >
                <Check className="w-4 h-4" />
                {saveProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </Button>
              <Button type="button" variant="outline" className="min-h-[48px] gap-2" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
