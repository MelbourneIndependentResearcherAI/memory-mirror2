import React, { useMemo } from 'react';
import { ArrowLeft, MessageCircle, TrendingUp, BarChart3, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, subDays, parseISO } from 'date-fns';

const ERA_COLORS = {
  '1940s': '#3B82F6',
  '1960s': '#8B5CF6',
  '1980s': '#EC4899',
  'present': '#10B981',
};

export default function ConversationAnalyticsPage() {
  const navigate = useNavigate();

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['conversationActivityLogs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 200).catch(() => [])
  });

  const chatLogs = useMemo(
    () => activityLogs.filter(l => l.activity_type === 'chat'),
    [activityLogs]
  );

  const anxietyLogs = useMemo(
    () => activityLogs.filter(l => l.activity_type === 'anxiety_detected'),
    [activityLogs]
  );

  const conversationTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = format(day, 'EEE');
      const dayLogs = chatLogs.filter(l => {
        if (!l.created_date) return false;
        return format(parseISO(l.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      const anxietyDay = anxietyLogs.filter(l => {
        if (!l.created_date) return false;
        return format(parseISO(l.created_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      const avgAnxiety = anxietyDay.length > 0
        ? anxietyDay.reduce((s, l) => s + (l.anxiety_level || 0), 0) / anxietyDay.length
        : 0;
      return {
        day: dayStr,
        messages: dayLogs.length,
        sentiment: Math.max(0, 10 - avgAnxiety),
      };
    });
  }, [chatLogs, anxietyLogs]);

  const eraDistribution = useMemo(() => {
    const counts = {};
    chatLogs.forEach(l => {
      const era = l.details?.era || 'present';
      counts[era] = (counts[era] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name === 'present' ? 'Present' : name,
      value,
      color: ERA_COLORS[name] || '#6B7280',
    }));
  }, [chatLogs]);

  const sentimentMetrics = useMemo(() => {
    const buckets = { Morning: [], Afternoon: [], Evening: [] };
    anxietyLogs.forEach(l => {
      if (!l.created_date) return;
      const hour = parseISO(l.created_date).getHours();
      const level = l.anxiety_level || 0;
      if (hour >= 5 && hour < 12) buckets.Morning.push(level);
      else if (hour >= 12 && hour < 18) buckets.Afternoon.push(level);
      else buckets.Evening.push(level);
    });
    return ['Morning', 'Afternoon', 'Evening'].map(time => {
      const levels = buckets[time];
      const avgAnxiety = levels.length > 0 ? levels.reduce((s, v) => s + v, 0) / levels.length : 0;
      const positive = Math.round(Math.max(0, 70 - avgAnxiety * 5));
      const negative = Math.round(Math.min(30, avgAnxiety * 3));
      return { time, positive, neutral: 100 - positive - negative, negative };
    });
  }, [anxietyLogs]);

  const totalConversations = chatLogs.length;
  const avgSentiment = anxietyLogs.length > 0
    ? (10 - anxietyLogs.reduce((s, l) => s + (l.anxiety_level || 0), 0) / anxietyLogs.length).toFixed(1)
    : '—';
  const thisWeekCount = conversationTrendData.reduce((s, d) => s + d.messages, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-400" />
            Chat History
          </h1>
          <p className="text-slate-400 text-lg">
            Track emotional patterns and conversation insights
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-400 text-xl">Loading conversation data…</div>
        ) : totalConversations === 0 ? (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl">No conversations recorded yet.</p>
            <p className="text-slate-500 mt-2">Conversations will appear here as your loved one chats with Memory Mirror.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Conversations</p>
                    <p className="text-3xl font-bold text-white">{totalConversations}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-400 opacity-30" />
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Avg Sentiment</p>
                    <p className="text-3xl font-bold text-white">{avgSentiment}{avgSentiment !== '—' ? '/10' : ''}</p>
                  </div>
                  <Smile className="w-8 h-8 text-green-400 opacity-30" />
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">This Week</p>
                    <p className="text-3xl font-bold text-white">{thisWeekCount}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Weekly Conversation Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversationTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#FFF' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      name="Messages"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {eraDistribution.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Mental Era Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eraDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eraDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#FFF' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Sentiment by Time of Day</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#FFF' }}
                  />
                  <Legend />
                  <Bar dataKey="positive" fill="#10B981" />
                  <Bar dataKey="neutral" fill="#6B7280" />
                  <Bar dataKey="negative" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Conversation Activity</h2>
              <div className="space-y-3">
                {activityLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-white capitalize">
                        {log.activity_type?.replace(/_/g, ' ') || 'Activity'}
                      </p>
                      {log.details?.era && (
                        <p className="text-sm text-slate-400">Era: {log.details.era}</p>
                      )}
                      {log.anxiety_level != null && (
                        <p className="text-sm text-slate-400">Anxiety: {log.anxiety_level}/10</p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 ml-4">
                      {log.created_date
                        ? format(parseISO(log.created_date), 'MMM d, h:mm a')
                        : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
