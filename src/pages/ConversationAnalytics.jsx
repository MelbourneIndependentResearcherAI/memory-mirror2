import { useMemo } from 'react';
import { ArrowLeft, MessageCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { offlineEntities } from '@/components/utils/offlineAPI';
import { format, subDays, isAfter } from 'date-fns';

const ERA_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4'];
import { base44 } from '@/api/base44Client';
import { format, subDays, parseISO } from 'date-fns';

const ERA_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#06B6D4"];

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


  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  const thisWeekSessions = recentConvos.length;
  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ["conversationActivityLogs"],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 200).catch(() => []),
  });

  const chatLogs = useMemo(
    () => activityLogs.filter((l) => l.activity_type === "chat"),
    [activityLogs]
  );

  const anxietyLogs = useMemo(
    () => activityLogs.filter((l) => l.activity_type === "anxiety_detected"),
    [activityLogs]
  );

  const conversationTrendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = subDays(new Date(), 6 - i);
      const dayStr = format(day, "EEE");
      const dayLogs = chatLogs.filter((l) => {
        return format(parseISO(l.created_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });
      const anxietyDay = anxietyLogs.filter((l) => {
        return format(parseISO(l.created_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });
      const avgAnxiety =
        anxietyDay.length > 0
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
    chatLogs.forEach((l) => {
      const era = l.details?.era || "present";
      counts[era] = (counts[era] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], idx) => ({
      name: name === "present" ? "Present" : name,
      value,
      color: ERA_COLORS[idx % ERA_COLORS.length],
    }));
  }, [chatLogs]);

  const totalConversations = chatLogs.length;
  const avgSentiment =
    anxietyLogs.length > 0
      ? (10 - anxietyLogs.reduce((s, l) => s + (l.anxiety_level || 0), 0) / anxietyLogs.length).toFixed(1)
      : "--";
  const thisWeekCount = conversationTrendData.reduce((s, d) => s + d.messages, 0);
  const hasRealData = chatLogs.length > 0;

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
            Chat Analytics
          </h1>
          <p className="text-slate-400 text-lg">Track emotional patterns and conversation insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{isLoading ? "..." : totalConversations}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Sentiment</p>
                <p className="text-3xl font-bold text-white">{isLoading ? "..." : avgSentiment}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-30" />
            </div>
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
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-3xl font-bold text-white">{isLoading ? "..." : thisWeekCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
            </div>
          </>
        )}
        </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No conversation data yet</h3>
            <p className="text-slate-500">Analytics will appear here once chat sessions have been recorded.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Weekly Session Trends</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendByDay}>

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
                      dataKey="messages"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Weekly Conversation Trends</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversationTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                  <Legend />
                  <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} name="Sessions" />
                  <Line type="monotone" dataKey="sentiment" stroke="#10B981" strokeWidth={2} name="Sentiment" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {eraDistribution.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Era Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={eraDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {eraDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
