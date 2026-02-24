import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WellbeingOverview from '@/components/family/WellbeingOverview';

export default function FamilyOverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 dark:from-slate-950 dark:via-pink-950 dark:to-orange-950 p-4 md:p-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Well-being Overview</h1>
          <WellbeingOverview />
        </div>
      </div>
    </div>
  );
}