import React from 'react';
import { useNavigate } from 'react-router-dom';
import NightWatch from '@/components/memory-mirror/NightWatch';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function NightWatchPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950">
      <NightWatch onClose={() => navigate('/')} />
      <PageLoadTip pageName="NightWatch" />
    </div>
  );
}