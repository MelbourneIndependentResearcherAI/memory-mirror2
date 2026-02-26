import React from 'react';
import SecurityReassurance from '../components/security/SecurityReassurance';
import PageLoadTip from '@/components/tips/PageLoadTip';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <SecurityReassurance />
      <PageLoadTip pageName="Security" />
    </div>
  );
}