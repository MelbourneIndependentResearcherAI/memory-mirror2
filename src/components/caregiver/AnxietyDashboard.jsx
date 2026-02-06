import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnxietyDashboard() {
  const { data: trends = [] } = useQuery({
    queryKey: ['anxietyTrends'],
    queryFn: () => base44.entities.AnxietyTrend.list('-date', 30),
  });

  const avgAnxiety = trends.length > 0 
    ? (trends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / trends.length).toFixed(1)
    : 0;

  const triggerCounts = trends.reduce((acc, t) => {
    if (t.trigger_category && t.trigger_category !== 'none') {
      acc[t.trigger_category] = (acc[t.trigger_category] || 0) + 1;
    }
    return acc;
  }, {});

  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Anxiety Insights (Last 30 Days)</CardTitle>
          <p className="text-sm text-slate-600">
            Anonymized trends to understand patterns and improve care
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">Average Anxiety</h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">{avgAnxiety} / 10</p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold">Total Interactions</h3>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {trends.reduce((sum, t) => sum + (t.interaction_count || 0), 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold">Top Trigger</h3>
                </div>
                <p className="text-xl font-bold text-amber-600 capitalize">
                  {topTrigger ? `${topTrigger[0]} (${topTrigger[1]}x)` : 'None'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {trends.map((trend, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{trend.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={trend.anxiety_level >= 7 ? 'destructive' : trend.anxiety_level >= 4 ? 'secondary' : 'outline'}>
                        Anxiety: {trend.anxiety_level}/10
                      </Badge>
                      {trend.trigger_category && trend.trigger_category !== 'none' && (
                        <Badge variant="outline" className="capitalize">{trend.trigger_category}</Badge>
                      )}
                      <Badge variant="outline">{trend.mode_used}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {trends.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No anxiety data recorded yet
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}