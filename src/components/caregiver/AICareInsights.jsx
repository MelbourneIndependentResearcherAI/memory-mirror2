import React, { useState } from 'react';
import { Sparkles, TrendingUp, Heart, AlertCircle, Lightbulb, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AICareInsights() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['careInsights'],
    queryFn: async () => {
      const result = await base44.functions.invoke('generateCareInsights', {});
      return result.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 1
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Insights updated!');
    } catch {
      toast.error('Failed to refresh insights');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-purple-600 dark:text-purple-400">Analyzing care data...</span>
        </CardContent>
      </Card>
    );
  }

  const insightData = insights?.insights || insights?.fallback;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">AI Care Insights</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Powered by intelligent analysis of all care data
                </p>
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {insights?.dataAnalyzed && (
            <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-400">
              Analyzed: {insights.dataAnalyzed.activityCount} activities, {insights.dataAnalyzed.journalCount} journal entries, {insights.dataAnalyzed.anxietyDays} anxiety trends, {insights.dataAnalyzed.nightIncidentsCount} night incidents
            </div>
          )}

          {/* Overall Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  Overall Wellbeing Status
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insightData?.overallSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Key Patterns */}
          {insightData?.keyPatterns?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                    Key Patterns Identified
                  </h3>
                  <ul className="space-y-2">
                    {insightData.keyPatterns.map((pattern, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Emotional State */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mt-1 fill-cyan-600 dark:fill-cyan-400" />
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  Emotional State Assessment
                </h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {insightData?.emotionalState}
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {insightData?.recommendations?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                    Recommendations for You
                  </h3>
                  <ul className="space-y-2">
                    {insightData.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Activities */}
          {insightData?.suggestedActivities?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                    Suggested Topics for AI Companion
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {insightData.suggestedActivities.map((activity, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg text-sm font-medium"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Areas of Concern */}
          {insightData?.areasOfConcern?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                    Areas Needing Attention
                  </h3>
                  <ul className="space-y-2">
                    {insightData.areasOfConcern.map((concern, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-orange-600 dark:text-orange-400 mt-1">⚠</span>
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Positive Highlights */}
          {insightData?.positiveHighlights?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
                    What's Going Well
                  </h3>
                  <ul className="space-y-2">
                    {insightData.positiveHighlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-600 dark:text-emerald-400 mt-1">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}