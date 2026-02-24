import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CaregiverPortalRouter from './CaregiverPortalRouter';

export default function CaregiverPortal() {
  return (
    <Routes>
      <Route path="/*" element={<CaregiverPortalRouter />} />
    </Routes>
  );
}