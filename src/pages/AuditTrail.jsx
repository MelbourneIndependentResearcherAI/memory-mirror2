import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuditLogViewer from '@/components/admin/AuditLogViewer';
import { base44 } from '@/api/base44Client';

export default function AuditTrailPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setIsAdmin(user?.role === 'admin');
    }).catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
        <div className="text-center">
          <ShieldOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You don't have permission to view this page.</p>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mx-auto min-h-[44px]">
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <AuditLogViewer />
        </div>
      </div>
    </div>
  );
}