import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MemorySessionLauncher from '@/components/memory/MemorySessionLauncher';

export default function MemorySessions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              ✨ Memory Sessions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              AI-guided interactive memory experiences
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8">
          <MemorySessionLauncher onBack={() => navigate(-1)} />
        </div>
      </div>
    </div>
  );
}