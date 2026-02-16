import React from 'react';
import { useNavigate } from 'react-router-dom';
import NightWatch from '@/components/memory-mirror/NightWatch';

export default function NightWatchPage() {
  const navigate = useNavigate();

  return <NightWatch onClose={() => navigate('/')} />;
}