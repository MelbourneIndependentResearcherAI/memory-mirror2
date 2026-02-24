import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function HealthMonitor() {
  const navigate = useNavigate();
  const [emotionalState, setEmotionalState] = useState('calm');
  const [anxietyLevel, setAnxietyLevel] = useState(3);

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: () => base44.entities.ActivityLog.list().catch(() => [])
  });

  useEffect(() => {
    // Analyze recent activity to determine emotional state
    if (activityLogs.length > 0) {
      const recentLogs = activityLogs.slice(0, 10);
      
      // Calculate anxiety level from recent activities
      const anxietyDetected = recentLogs.filter(log => 
        log.activity_type?.includes('anxiety') || 
        log.details?.anxiety_level !== undefined
      ).length;
      
      const avgAnxiety = recentLogs.reduce((sum, log) => {
        return sum + (log.anxiety_level || log.details?.anxiety_level || 3);
      }, 0) / Math.max(recentLogs.length, 1);

      setAnxietyLevel(Math.round(Math.min(10, Math.max(1, avgAnxiety))));

      // Determine emotional state based on anxiety
      if (avgAnxiety > 7) {
        setEmotionalState('distressed');
      } else if (avgAnxiety > 5) {
        setEmotionalState('anxious');
      } else if (avgAnxiety > 3) {
        setEmotionalState('neutral');
      } else {
        setEmotionalState('calm');
      }
    }
  }, [activityLogs]);

  const getEmotionalColor = () => {
    switch (emotionalState) {
      case 'distressed':
        return 'from-red-500 to-orange-500';
      case 'anxious':
        return 'from-orange-500 to-yellow-500';
      case 'neutral':
        return 'from-yellow-500 to-blue-500';
      case 'calm':
        return 'from-blue-500 to-green-500';
      default:
        return 'from-blue-500 to-green-500';
    }
  };

  const getEmotionalLabel = () => {
    switch (emotionalState) {
      case 'distressed':
        return '😔 Distressed';
      case 'anxious':
        return '😟 Anxious';
      case 'neutral':
        return '😐 Neutral';
      case 'calm':
        return '😊 Calm';
      default:
        return '😊 Calm';
    }
  };

  const getAnxietyColor = (level) => {
    if (level > 7) return 'from-red-500 to-red-400';
    if (level > 5) return 'from-orange-500 to-orange-400';
    if (level > 3) return 'from-yellow-500 to-yellow-400';
    return 'from-green-500 to-green-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 pb-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 mb-6 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Health Monitor
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Real-time emotional state and anxiety tracking
          </p>
        </div>

        {/* Emotional State Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Emotional State
          </h2>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`bg-gradient-to-br ${getEmotionalColor()} rounded-full p-1 mb-6 shadow-lg`}>
              <div className="bg-white dark:bg-slate-900 rounded-full p-8">
                <Heart className="w-24 h-24 text-slate-800 dark:text-slate-100" />
              </div>
            </div>
            
            <h3 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-4">
              {getEmotionalLabel()}
            </h3>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 text-center max-w-md">
              {emotionalState === 'calm' && 'Your loved one is feeling peaceful and relaxed.'}
              {emotionalState === 'neutral' && 'Your loved one is stable and managing well.'}
              {emotionalState === 'anxious' && 'Your loved one may benefit from extra support.'}
              {emotionalState === 'distressed' && 'Your loved one needs immediate comfort and care.'}
            </p>
          </div>
        </div>

        {/* Anxiety Level Gauge */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
            Anxiety Level
          </h2>
          
          <div className="space-y-4">
            {/* Gauge Background */}
            <div className="relative">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getAnxietyColor(anxietyLevel)} transition-all duration-500 flex items-center justify-center`}
                  style={{ width: `${(anxietyLevel / 10) * 100}%` }}
                >
                  {anxietyLevel >= 4 && (
                    <span className="text-white font-bold text-sm">
                      {anxietyLevel}/10
                    </span>
                  )}
                </div>
              </div>
              {anxietyLevel < 4 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 font-bold text-slate-800 dark:text-slate-100">
                  {anxietyLevel}/10
                </div>
              )}
            </div>

            {/* Level Labels */}
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mt-4">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
            </div>

            {/* Status Message */}
            <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-700 dark:text-slate-300">
                {anxietyLevel <= 2 && '✅ Excellent - minimal anxiety detected'}
                {anxietyLevel > 2 && anxietyLevel <= 4 && '✅ Good - low anxiety levels'}
                {anxietyLevel > 4 && anxietyLevel <= 6 && '⚠️ Caution - moderate anxiety. Consider engaging in calming activities'}
                {anxietyLevel > 6 && anxietyLevel <= 8 && '⚠️ Warning - elevated anxiety. Recommend immediate comfort measures'}
                {anxietyLevel > 8 && '🚨 Alert - high anxiety. Urgent support recommended'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Recent Activity
          </h2>
          
          {activityLogs.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 py-8 text-center">
              No recent activity recorded. System will track emotional patterns as activity is logged.
            </p>
          ) : (
            <div className="space-y-3">
              {activityLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 capitalize">
                      {log.activity_type?.replace(/_/g, ' ') || 'Activity'}
                    </p>
                    {log.anxiety_level && (
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Anxiety: {log.anxiety_level}/10
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {log.created_date && new Date(log.created_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}