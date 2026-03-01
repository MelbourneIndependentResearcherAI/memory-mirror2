import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Activity, MessageSquare, Moon, Music, Brain } from 'lucide-react';

const activityIcons = {
  chat: MessageSquare,
  phone_call: Activity,
  security_check: Activity,
  game_played: Brain,
  memory_viewed: Brain,
  anxiety_detected: Activity,
};

const activityColors = {
  chat: 'bg-blue-100 text-blue-700',
  phone_call: 'bg-green-100 text-green-700',
  game_played: 'bg-yellow-100 text-yellow-700',
  memory_viewed: 'bg-purple-100 text-purple-700',
  anxiety_detected: 'bg-red-100 text-red-700',
  security_check: 'bg-slate-100 text-slate-700',
};

export default function FamilyActivityReport({ isAdmin }) {
  const [range, setRange] = useState(7);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activityLogs', range],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100)
  });

  const cutoff = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
  const filtered = logs.filter(l => new Date(l.created_date) >= cutoff);

  const counts = filtered.reduce((acc, l) => {
    acc[l.activity_type] = (acc[l.activity_type] || 0) + 1;
    return acc;
  }, {});

  const avgAnxiety = filtered.filter(l => l.anxiety_level != null).reduce((acc, l, _, arr) => acc + l.anxiety_level / arr.length, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5" /> Activity Report</CardTitle>
          <div className="flex gap-2">
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setRange(d)} className={`px-3 py-1 rounded-full text-sm font-medium transition-all min-h-[36px] ${range === d ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                {d}d
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-slate-500 py-8">Loading reports...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{filtered.length}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Activities</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{avgAnxiety > 0 ? avgAnxiety.toFixed(1) : '—'}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Avg Anxiety (0-10)</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 text-center col-span-2 md:col-span-1">
                  <p className="text-3xl font-bold text-green-600">{counts.chat || 0}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Chat Sessions</p>
                </div>
              </div>

              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Activity Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(counts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <Badge className={activityColors[type] || 'bg-slate-100 text-slate-700'}>
                        {type.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2 w-24 overflow-hidden">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, (count / filtered.length) * 100)}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
                {Object.keys(counts).length === 0 && (
                  <p className="text-slate-500 text-center py-6">No activity in this period</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}