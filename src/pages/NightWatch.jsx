import React from 'react';
import { useNavigate } from 'react-router-dom';
import NightWatch from '@/components/memory-mirror/NightWatch';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function NightWatchPage() {
  const navigate = useNavigate();

  return (
    <>
      <NightWatch onClose={() => navigate('/')} />
      <PageLoadTip pageName="NightWatch" />
    </>
  );
}