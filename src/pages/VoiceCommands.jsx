import React, { useState } from 'react';
import { ArrowLeft, Mic, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function VoiceCommandsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const voiceCommands = [
    { id: 1, trigger: 'Hey Mirror, turn on the lights', action: 'Smart Home Control', description: 'Activates main room lighting' },
    { id: 2, trigger: 'Hey Mirror, play music', action: 'Music Playback', description: 'Starts playing favorite playlist' },
    { id: 3, trigger: 'Hey Mirror, tell me a story', action: 'Story Time', description: 'Narrates a family memory' },
    { id: 4, trigger: 'Hey Mirror, what time is it', action: 'Time & Date', description: 'Announces current time' },
    { id: 5, trigger: 'Hey Mirror, call caregiver', action: 'Emergency Contact', description: 'Initiates emergency call' },
    { id: 6, trigger: 'Hey Mirror, show photos', action: 'Photo Gallery', description: 'Displays family photo album' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-6 pb-16">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 min-h-[44px] text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Mic className="w-10 h-10 text-blue-400" />
              Voice Commands
            </h1>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Command
            </Button>
          </div>
          <p className="text-slate-400 text-lg">
            Manage voice commands and custom actions
          </p>
        </div>

        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Create New Command</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Voice Trigger
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hey Mirror, turn on the lights"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Action
                </label>
                <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white">
                  <option>Select Action...</option>
                  <option>Smart Home Control</option>
                  <option>Music Playback</option>
                  <option>Story Time</option>
                  <option>Emergency Contact</option>
                  <option>Custom Response</option>
                </select>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Save Command
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {voiceCommands.map(command => (
            <div
              key={command.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-blue-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {command.trigger}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {command.description}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-blue-400"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="inline-block px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-full text-xs text-blue-300">
                {command.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}