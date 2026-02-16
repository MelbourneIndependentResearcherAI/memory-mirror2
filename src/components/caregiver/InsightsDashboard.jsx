import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Brain, MessageCircle, Heart, Calendar, Download, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function InsightsDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [generatingReport, setGeneratingReport] = useState(false);

  // Fetch anxiety trends
  const { data: anxietyTrends = [], isLoading: loadingAnxiety } = useQuery({
    queryKey: ['anxietyTrends', timeRange],
    queryFn: async () => {
      const days = timeRange === 'week' ? 7 : 30;
      const trends = await base44.entities.AnxietyTrend.list('-date', days);
      return trends;
    }
  });

  // Fetch activity logs
  const { data: activityLogs = [], isLoading: loadingActivity } = useQuery({
    queryKey: ['activityLogs', timeRange],
    queryFn: async () => {
      const days = timeRange === 'week' ? 7 : 30;
      const logs = await base44.entities.ActivityLog.list('-created_date', 100);
      return logs.slice(0, days * 5); // Approximate filtering
    }
  });

  // Fetch cognitive assessments
  const { data: assessments = [] } = useQuery({
    queryKey: ['cognitiveAssessments'],
    queryFn: () => base44.entities.CognitiveAssessment.list('-assessment_date', 10)
  });

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', timeRange],
    queryFn: async () => {
      const convos = await base44.entities.Conversation.list('-created_date', 50);
      return convos;
    }
  });

  // Process anxiety data
  const anxietyChartData = anxietyTrends
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(trend => ({
      date: format(new Date(trend.date), 'MMM dd'),
      level: trend.anxiety_level,
      interactions: trend.interaction_count
    }));

  const avgAnxiety = anxietyTrends.length > 0
    ? (anxietyTrends.reduce((sum, t) => sum + t.anxiety_level, 0) / anxietyTrends.length).toFixed(1)
    : 0;

  const anxietyTrend = anxietyTrends.length >= 2
    ? anxietyTrends[0].anxiety_level - anxietyTrends[anxietyTrends.length - 1].anxiety_level
    : 0;

  // Process conversation themes
  const themeData = anxietyTrends.reduce((acc, trend) => {
    const category = trend.trigger_category || 'none';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const themesChartData = Object.entries(themeData)
    .filter(([key]) => key !== 'none')
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Process activity distribution
  const activityData = activityLogs.reduce((acc, log) => {
    acc[log.activity_type] = (acc[log.activity_type] || 0) + 1;
    return acc;
  }, {});

  const activityChartData = Object.entries(activityData).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value
  }));

  // Mode usage
  const modeData = anxietyTrends.reduce((acc, trend) => {
    acc[trend.mode_used] = (acc[trend.mode_used] || 0) + 1;
    return acc;
  }, {});

  const modeChartData = Object.entries(modeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const result = await base44.functions.invoke('generateCaregiverInsights', {
        timeRange,
        anxietyTrends,
        activityLogs,
        conversations: conversations.slice(0, 10),
        assessments
      });

      // Create a downloadable report
      const reportText = result.data.report;
      const blob = new Blob([reportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `caregiver-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const latestAssessment = assessments[0];
  const cognitiveProgress = assessments.length >= 2
    ? assessments[1].cognitive_level !== assessments[0].cognitive_level
      ? 'changed'
      : 'stable'
    : 'stable';

  if (loadingAnxiety || loadingActivity) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Emotional & Cognitive Insights
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track patterns, trends, and progress over time
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            onClick={generateReport}
            disabled={generatingReport}
            className="gap-2"
          >
            {generatingReport ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Avg Anxiety Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {avgAnxiety}
                <span className="text-sm text-slate-500 dark:text-slate-400">/10</span>
              </div>
              {anxietyTrend !== 0 && (
                <div className={`flex items-center gap-1 text-sm ${anxietyTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {anxietyTrend < 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      {Math.abs(anxietyTrend).toFixed(1)}
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      +{anxietyTrend.toFixed(1)}
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {anxietyTrends.reduce((sum, t) => sum + (t.interaction_count || 0), 0)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Across all modes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Cognitive Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">
                {latestAssessment?.cognitive_level || 'N/A'}
              </div>
              <Brain className={`w-6 h-6 ${
                cognitiveProgress === 'stable' ? 'text-blue-500' : 'text-amber-500'
              }`} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {cognitiveProgress === 'stable' ? 'Stable' : 'Changed recently'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Most Used Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 capitalize">
              {modeChartData[0]?.name || 'Chat'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {modeChartData[0]?.value || 0} sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anxiety Trend Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Anxiety Level Trend
            </CardTitle>
            <CardDescription>
              Daily anxiety levels over the {timeRange === 'week' ? 'past week' : 'past month'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {anxietyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={anxietyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="level"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Anxiety Level"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">No anxiety data available</p>
            )}
          </CardContent>
        </Card>

        {/* Conversation Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              Common Conversation Themes
            </CardTitle>
            <CardDescription>
              Topics that appear most frequently
            </CardDescription>
          </CardHeader>
          <CardContent>
            {themesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={themesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">No theme data available</p>
            )}
          </CardContent>
        </Card>

        {/* Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Activity Distribution
            </CardTitle>
            <CardDescription>
              How time is spent across different activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={activityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {activityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">No activity data available</p>
            )}
          </CardContent>
        </Card>

        {/* Mode Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-500" />
              Mode Preferences
            </CardTitle>
            <CardDescription>
              Which interaction modes are used most
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={modeChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" name="Sessions" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-400 py-12">No mode data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cognitive Assessment History */}
      {assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Assessment History</CardTitle>
            <CardDescription>
              Track changes in cognitive level over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessments.slice(0, 5).map((assessment, idx) => (
                <div key={assessment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {format(new Date(assessment.assessment_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      Level: {assessment.cognitive_level}
                    </p>
                  </div>
                  <div className="text-right">
                    {assessment.indicators && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p>Memory: {assessment.indicators.memory_recall_accuracy}/10</p>
                        <p>Language: {assessment.indicators.language_complexity}/10</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {latestAssessment?.recommended_adaptations?.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">
              Current Recommendations
            </CardTitle>
            <CardDescription className="text-blue-700 dark:text-blue-300">
              Based on the latest cognitive assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {latestAssessment.recommended_adaptations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-blue-800 dark:text-blue-200">
                  <span className="text-blue-500 dark:text-blue-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}