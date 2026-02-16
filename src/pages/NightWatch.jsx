import React from 'react';
import NightWatch from '@/components/memory-mirror/NightWatch';
import { useNavigate } from 'react-router-dom';

export default function NightWatchPage() {
  const navigate = useNavigate();

  return (
    <NightWatch onClose={() => navigate('/')} />
  );
}