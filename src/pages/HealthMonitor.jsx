import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, TrendingUp, Brain, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

export default function HealthMonitor() {
  const navigate = useNavigate();

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list()
  });

  const { data: anxietyTrends = [] } = useQuery({
    queryKey: ['anxietyTrends'],
    queryFn: () => base44.entities.AnxietyTrend.list('-created_date', 30)
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 10)
  });

  const { data: cognitiveAssessments = [] } = useQuery({
    queryKey: ['cognitiveAssessments'],
    queryFn: () => base44.entities.CognitiveAssessment.list('-created_date', 5)
  });

  const userProfile = userProfiles[0];
  const latestAnxiety = anxietyTrends[0];
  const latestAssessment = cognitiveAssessments[0];

  const averageAnxiety = anxietyTrends.length > 0
    ? (anxietyTrends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / anxietyTrends.length).toFixed(1)
    : 0;

  const getAnxietyColor = (level) => {
    if (level >= 7) return 'text-red-600 bg-red-100';
    if (level >= 4) return 'text-amber-600 bg-amber-100';
    return 'text-green-600 bg-green-100';
  };

  const getAnxietyLabel = (level) => {
    if (level >= 7) return 'High Anxiety';
    if (level >= 4) return 'Moderate';
    return 'Calm';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 pb-20">
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
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
              <Heart className="w-10 h-10 text-red-500" />
              Health Monitor
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Current emotional state and wellbeing overview
            </p>
          </div>
        </div>

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Current Anxiety Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold text-slate-900 dark:text-slate-100">
                  {latestAnxiety?.anxiety_level || 0}
                </div>
                <div className="text-2xl text-slate-400 mb-1">/10</div>
              </div>
              <Badge className={`mt-3 ${getAnxietyColor(latestAnxiety?.anxiety_level || 0)}`}>
                {getAnxietyLabel(latestAnxiety?.anxiety_level || 0)}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                30-Day Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                  {averageAnxiety}
                </div>
                <div className="text-2xl text-slate-400 mb-1">/10</div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4" />
                <span>Based on {anxietyTrends.length} readings</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Cognitive Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {latestAssessment?.cognitive_level || 'N/A'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {latestAssessment?.assessment_type || 'No assessment yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Profile Summary */}
        {userProfile && (
          <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                {userProfile.loved_one_name || userProfile.preferred_name || 'User'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {userProfile.birth_year && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Age:</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {new Date().getFullYear() - userProfile.birth_year} years old
                  </span>
                </div>
              )}
              {userProfile.favorite_era && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Favorite Era:</span>
                  <Badge variant="outline">{userProfile.favorite_era}</Badge>
                </div>
              )}
              {userProfile.interests?.length > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 mt-1">Interests:</span>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLogs.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
                          {log.activity_type?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {log.details?.description || 'Activity logged'}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(log.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.anxiety_level && (
                      <div className="mt-2">
                        <Badge className={getAnxietyColor(log.anxiety_level)}>
                          Anxiety: {log.anxiety_level}/10
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anxiety Trend Chart */}
        {anxietyTrends.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Anxiety Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {anxietyTrends.slice(0, 30).reverse().map((trend, idx) => {
                  const height = (trend.anxiety_level / 10) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${new Date(trend.created_date).toLocaleDateString()}: ${trend.anxiety_level}/10`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-2">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}