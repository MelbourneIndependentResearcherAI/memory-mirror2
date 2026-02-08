import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageCircle, Phone, Shield, Gamepad2, TrendingDown, TrendingUp, Minus, Heart } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function WellbeingOverview() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 50),
  });

  const { data: anxietyTrends = [] } = useQuery({
    queryKey: ['anxietyTrends'],
    queryFn: () => base44.entities.AnxietyTrend.list('-date', 7),
  });

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading activity summary...</div>;
  }

  // Calculate last 24 hours activity
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivities = activities.filter(a => new Date(a.created_date) > oneDayAgo);

  const activityCounts = {
    chat: recentActivities.filter(a => a.activity_type === 'chat').length,
    phone_call: recentActivities.filter(a => a.activity_type === 'phone_call').length,
    security_check: recentActivities.filter(a => a.activity_type === 'security_check').length,
    game_played: recentActivities.filter(a => a.activity_type === 'game_played').length,
  };

  const totalInteractions = Object.values(activityCounts).reduce((sum, count) => sum + count, 0);

  // Average anxiety level (last 7 days)
  const avgAnxiety = anxietyTrends.length > 0
    ? anxietyTrends.reduce((sum, t) => sum + t.anxiety_level, 0) / anxietyTrends.length
    : 0;

  const anxietyTrend = anxietyTrends.length >= 2
    ? anxietyTrends[0].anxiety_level - anxietyTrends[anxietyTrends.length - 1].anxiety_level
    : 0;

  const getTrendIcon = () => {
    if (anxietyTrend > 1) return <TrendingUp className="w-4 h-4 text-amber-600" />;
    if (anxietyTrend < -1) return <TrendingDown className="w-4 h-4 text-emerald-600" />;
    return <Minus className="w-4 h-4 text-slate-600" />;
  };

  const getWellbeingStatus = () => {
    if (totalInteractions === 0) return { status: 'low', color: 'text-amber-600', bg: 'bg-amber-50', message: 'Low activity in the last 24 hours' };
    if (avgAnxiety < 3) return { status: 'good', color: 'text-emerald-600', bg: 'bg-emerald-50', message: 'Doing well with low stress levels' };
    if (avgAnxiety < 6) return { status: 'moderate', color: 'text-blue-600', bg: 'bg-blue-50', message: 'Moderate engagement, stable mood' };
    return { status: 'needs_attention', color: 'text-orange-600', bg: 'bg-orange-50', message: 'Some elevated stress detected' };
  };

  const wellbeing = getWellbeingStatus();

  return (
    <div className="space-y-6">
      <Alert className={`${wellbeing.bg} border-${wellbeing.status === 'good' ? 'emerald' : 'amber'}-200`}>
        <Heart className={`w-4 h-4 ${wellbeing.color}`} />
        <AlertDescription className={wellbeing.color}>
          <strong>Current Status:</strong> {wellbeing.message}
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Activity Summary</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Chat Sessions</span>
              </div>
              <span className="font-semibold">{activityCounts.chat}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">Phone Calls</span>
              </div>
              <span className="font-semibold">{activityCounts.phone_call}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Security Checks</span>
              </div>
              <span className="font-semibold">{activityCounts.security_check}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Games Played</span>
              </div>
              <span className="font-semibold">{activityCounts.game_played}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Interactions</span>
                <span className="font-bold text-lg">{totalInteractions}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Mood Trends</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Average Comfort Level</span>
                {getTrendIcon()}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${avgAnxiety < 3 ? 'bg-emerald-500' : avgAnxiety < 6 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.max(10, 100 - (avgAnxiety * 10))}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{(10 - avgAnxiety).toFixed(1)}/10</span>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              {anxietyTrend < -1 && '📈 Comfort levels improving'}
              {anxietyTrend > 1 && '📉 May benefit from extra support'}
              {Math.abs(anxietyTrend) <= 1 && '➡️ Stable mood patterns'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}