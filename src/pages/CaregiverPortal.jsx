import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CaregiverPortalRouter from './CaregiverPortalRouter';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function CaregiverPortal() {
  return (
    <>
      <Routes>
        <Route path="/*" element={<CaregiverPortalRouter />} />
      </Routes>
      <PageLoadTip pageName="CaregiverPortal" />
    </>
  );
}