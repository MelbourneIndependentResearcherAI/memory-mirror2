import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, Brain, Heart, MessageCircle, TrendingUp, 
  AlertTriangle, Lightbulb, Loader2, RefreshCw 
} from 'lucide-react';

export default function ProactiveSuggestions() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: insights, isLoading, error, refetch } = useQuery({
    queryKey: ['caregiverInsights'],
    queryFn: async () => {
      const result = await base44.functions.invoke('generateCaregiverInsights', { days: 7 });
      return result.data;
    },
    refetchInterval: 1000 * 60 * 30, // Auto-refresh every 30 minutes
    staleTime: 1000 * 60 * 15, // Consider stale after 15 minutes
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <Card className="dark:bg-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>Failed to load insights. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const riskColors = {
    low: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
  };

  const riskIcons = {
    low: '✓',
    medium: '⚠',
    high: '⚠️'
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">AI Insights</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Last updated: {new Date(insights?.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Distress Risk Alert */}
      <Card className={`border-2 ${riskColors[insights?.insights?.distressRisk?.level || 'low']}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{riskIcons[insights?.insights?.distressRisk?.level || 'low']}</span>
              <div>
                <CardTitle className="text-lg">
                  Distress Risk: {insights?.insights?.distressRisk?.level?.toUpperCase() || 'LOW'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {insights?.insights?.distressRisk?.reasoning}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Summary */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            Emotional State Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {insights?.insights?.summary}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>📊 {insights?.activityCount} activities tracked</span>
            <span>📈 Avg anxiety: {insights?.avgAnxietyLevel}/10</span>
          </div>
        </CardContent>
      </Card>

      {/* Patterns Observed */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Patterns Observed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights?.insights?.patterns?.map((pattern, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span className="text-slate-700 dark:text-slate-300">{pattern}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Concerns */}
      {insights?.insights?.concerns?.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              Areas of Concern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.insights.concerns.map((concern, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-orange-600 dark:text-orange-400 mt-1">⚠</span>
                  <span className="text-slate-700 dark:text-slate-300">{concern}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Recommended Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights?.insights?.recommendations?.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <span className="text-xl">{idx + 1}.</span>
                <p className="text-slate-700 dark:text-slate-300 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Starters */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            Conversation Starters
          </CardTitle>
          <CardDescription>Topics that might bring comfort and joy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {insights?.insights?.conversationStarters?.map((starter, idx) => (
              <button
                key={idx}
                className="text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors min-h-[56px]"
                onClick={() => navigator.clipboard.writeText(starter)}
              >
                <p className="text-slate-700 dark:text-slate-300">💬 {starter}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to copy</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Activities */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Suggested Activities
          </CardTitle>
          <CardDescription>Based on recent preferences and mood</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {insights?.insights?.suggestedActivities?.map((activity, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="px-4 py-2 text-sm bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300"
              >
                {activity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}