import React from 'react';
import { ArrowLeft, Mic, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function VoiceUsageAnalyticsPage() {
  const navigate = useNavigate();

  const dailyUsageData = [
    { day: 'Mon', interactions: 12, duration: 45 },
    { day: 'Tue', interactions: 15, duration: 52 },
    { day: 'Wed', interactions: 10, duration: 38 },
    { day: 'Thu', interactions: 18, duration: 61 },
    { day: 'Fri', interactions: 14, duration: 48 },
    { day: 'Sat', interactions: 20, duration: 72 },
    { day: 'Sun', interactions: 16, duration: 55 }
  ];

  const commandUsageData = [
    { name: 'Music', value: 28, color: '#3B82F6' },
    { name: 'Smart Home', value: 22, color: '#10B981' },
    { name: 'Stories', value: 19, color: '#F59E0B' },
    { name: 'Info', value: 18, color: '#8B5CF6' },
    { name: 'Emergency', value: 13, color: '#EF4444' }
  ];

  const topCommands = [
    { command: 'Play music', count: 28, trend: '+15%' },
    { command: 'Turn on lights', count: 22, trend: '+8%' },
    { command: 'Tell a story', count: 19, trend: '+3%' },
    { command: 'What time is it', count: 18, trend: '-2%' },
    { command: 'Show photos', count: 15, trend: '+12%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-6 pb-16">
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
            Voice Usage Analytics
          </h1>
          <p className="text-slate-400 text-lg">
            Track voice interactions and patterns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Interactions</p>
                <p className="text-3xl font-bold text-white">105</p>
              </div>
              <Mic className="w-8 h-8 text-blue-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Avg Duration</p>
                <p className="text-3xl font-bold text-white">6m 15s</p>
              </div>
              <Clock className="w-8 h-8 text-green-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-white">94.2%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-30" />
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Most Used</p>
                <p className="text-xl font-bold text-white">Music</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400 opacity-30" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Daily Interactions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyUsageData}>
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
                  dataKey="interactions" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Command Usage Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={commandUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {commandUsageData.map((entry, index) => (
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

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Voice Commands</h2>
          <div className="space-y-4">
            {topCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-white">{cmd.command}</p>
                  <p className="text-sm text-slate-400">{cmd.count} uses this week</p>
                </div>
                <div className={`text-lg font-bold ${cmd.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {cmd.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}