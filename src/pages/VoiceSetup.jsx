import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AlwaysOnVoice from '@/components/memory-mirror/AlwaysOnVoice';

export default function VoiceSetupPage() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  useEffect(() => {
    if (profiles && profiles.length > 0) {
      setUserProfile(profiles[0]);
    }
  }, [profiles]);

  return (
    <AlwaysOnVoice 
      userProfile={userProfile}
      onClose={() => navigate('/')}
    />
  );
}