import React from 'react';
import { ArrowLeft, MessageCircle, TrendingUp, BarChart3, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ConversationAnalyticsPage() {
  const navigate = useNavigate();

  const conversationTrendData = [
    { day: 'Mon', messages: 8, avgLength: 45, sentiment: 7 },
    { day: 'Tue', messages: 12, avgLength: 52, sentiment: 8 },
    { day: 'Wed', messages: 7, avgLength: 38, sentiment: 6 },
    { day: 'Thu', messages: 15, avgLength: 61, sentiment: 8 },
    { day: 'Fri', messages: 10, avgLength: 48, sentiment: 7 },
    { day: 'Sat', messages: 14, avgLength: 72, sentiment: 9 },
    { day: 'Sun', messages: 11, avgLength: 55, sentiment: 8 }
  ];

  const eraDistribution = [
    { name: '1940s', value: 15, color: '#3B82F6' },
    { name: '1960s', value: 22, color: '#8B5CF6' },
    { name: '1980s', value: 28, color: '#EC4899' },
    { name: 'Present', value: 35, color: '#10B981' }
  ];

  const topTopics = [
    { topic: 'Family & Children', count: 18, sentiment: 8.5 },
    { topic: 'Travel & Adventure', count: 15, sentiment: 8.2 },
    { topic: 'Music & Entertainment', count: 14, sentiment: 8.8 },
    { topic: 'Cooking & Food', count: 12, sentiment: 8.3 },
    { topic: 'Garden & Nature', count: 10, sentiment: 8.1 }
  ];

  const sentimentMetrics = [
    { time: 'Morning', positive: 65, neutral: 25, negative: 10 },
    { time: 'Afternoon', positive: 72, neutral: 20, negative: 8 },
    { time: 'Evening', positive: 70, neutral: 22, negative: 8 }
  ];

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
                <p className="text-slate-400 text-sm mb-1">Total Conversations</p>
                <p className="text-3xl font-bold text-white">87</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Sentiment</p>
                <p className="text-3xl font-bold text-white">7.8/10</p>
              </div>
              <Smile className="w-8 h-8 text-green-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Duration</p>
                <p className="text-3xl font-bold text-white">12m 34s</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">This Week</p>
                <p className="text-3xl font-bold text-white">87</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400 opacity-30" />
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
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Top Conversation Topics</h2>
            <div className="space-y-4">
              {topTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{topic.topic}</p>
                    <p className="text-sm text-slate-400">{topic.count} mentions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">{topic.sentiment}/10</p>
                    <p className="text-xs text-slate-400">sentiment</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
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
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Emotional Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Most Active Time</p>
              <p className="text-2xl font-bold text-white">Afternoon (2-4 PM)</p>
              <p className="text-xs text-slate-400 mt-2">Highest engagement period</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Favorite Topic</p>
              <p className="text-2xl font-bold text-white">Family Stories</p>
              <p className="text-xs text-slate-400 mt-2">Most positive sentiment</p>
            </div>
            <div className="p-4 bg-slate-700 rounded-lg">
              <p className="text-slate-400 text-sm mb-2">Engagement Score</p>
              <p className="text-2xl font-bold text-white">8.5/10</p>
              <p className="text-xs text-slate-400 mt-2">Excellent engagement level</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}