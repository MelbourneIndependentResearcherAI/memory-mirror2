import React from 'react';
import { ArrowLeft, MessageCircle, TrendingUp, BarChart3, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { format, subDays, isAfter } from 'date-fns';

const ERA_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];

export default function ConversationAnalyticsPage() {
  const navigate = useNavigate();

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => offlineEntities.list('Conversation', '-created_date', 100)
  });

  // Build weekly trend data from real conversations
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentConvos = conversations.filter(c =>
    c.created_date && isAfter(new Date(c.created_date), sevenDaysAgo)
  );

  const trendByDay = weekDays.map(day => {
    const count = recentConvos.filter(c => {
      const d = c.created_date ? new Date(c.created_date) : null;
      return d && weekDays[d.getDay()] === day;
    }).length;
    const totalMsgs = recentConvos
      .filter(c => {
        const d = c.created_date ? new Date(c.created_date) : null;
        return d && weekDays[d.getDay()] === day;
      })
      .reduce((sum, c) => sum + (c.messages?.length || 0), 0);
    return { day, sessions: count, messages: totalMsgs };
  });

  const hasRealData = conversations.length > 0;

  // Era distribution from real data
  const eraCountMap = {};
  conversations.forEach(c => {
    const era = c.detected_era || 'Unknown';
    eraCountMap[era] = (eraCountMap[era] || 0) + 1;
  });
  const eraDistribution = Object.entries(eraCountMap).map(([name, value], idx) => ({
    name,
    value,
    color: ERA_COLORS[idx % ERA_COLORS.length]
  }));

  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const thisWeekSessions = recentConvos.length;

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
            Conversation Analytics
          </h1>
          <p className="text-slate-400 text-lg">
            Track emotional patterns and conversation insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{hasRealData ? conversations.length : '—'}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-white">{hasRealData ? totalMessages : '—'}</p>
              </div>
              <Smile className="w-8 h-8 text-green-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Eras Explored</p>
                <p className="text-3xl font-bold text-white">{hasRealData ? eraDistribution.length : '—'}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-3xl font-bold text-white">{hasRealData ? thisWeekSessions : '—'}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400 opacity-30" />
            </div>
          </div>
        </div>

        {!hasRealData ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No conversation data yet</h3>
            <p className="text-slate-500">
              Analytics will appear here once chat sessions have been recorded.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Weekly Session Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendByDay}>
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
                      dataKey="sessions"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                      name="Sessions"
                    />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      name="Messages"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Mental Era Distribution</h2>
                {eraDistribution.length > 0 ? (
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
                ) : (
                  <p className="text-center text-slate-400 py-12">No era data available</p>
                )}
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Sessions</h2>
              <div className="space-y-3">
                {conversations.slice(0, 5).map((convo, idx) => (
                  <div key={convo.id || idx} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        {convo.detected_era && convo.detected_era !== 'auto'
                          ? `${convo.detected_era} Era`
                          : 'Chat Session'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {convo.created_date
                          ? format(new Date(convo.created_date), 'MMM d, yyyy h:mm a')
                          : 'Unknown date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-400">
                        {convo.messages?.length || convo.message_count || 0}
                      </p>
                      <p className="text-xs text-slate-400">messages</p>
                    </div>
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