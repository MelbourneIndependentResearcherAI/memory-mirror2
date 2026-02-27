import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, TrendingUp, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdaptiveRoutineManager({ patientProfileId, patientName }) {
  const queryClient = useQueryClient();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newActivity, setNewActivity] = useState('');

  // Fetch routines
  const { data: routineData, isLoading } = useQuery({
    queryKey: ['routines', patientProfileId],
    queryFn: () => base44.entities.DailyRoutinePattern.filter({
      patient_profile_id: patientProfileId
    }),
    initialData: []
  });

  useEffect(() => {
    setRoutines(routineData || []);
    if (routineData?.length > 0 && !selectedRoutine) {
      setSelectedRoutine(routineData[0]);
    }
  }, [routineData]);

  // Adapt routine mutation
  const adaptRoutine = useMutation({
    mutationFn: async (routineId) => {
      const result = await base44.functions.invoke('adaptRoutinePatterns', {
        patient_profile_id: patientProfileId,
        current_routine_id: routineId
      });
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['routines', patientProfileId] });
      toast.success('✨ Routine adapted based on patterns!');
      console.log('Adaptations:', data.analysis);
    },
    onError: () => {
      toast.error('Failed to adapt routine');
    }
  });

  // Create routine mutation
  const createRoutine = useMutation({
    mutationFn: (routineData) => base44.entities.DailyRoutinePattern.create(routineData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', patientProfileId] });
      toast.success('Routine created!');
      setShowForm(false);
    },
    onError: () => {
      toast.error('Failed to create routine');
    }
  });

  // Update routine mutation
  const updateRoutine = useMutation({
    mutationFn: (data) => 
      base44.entities.DailyRoutinePattern.update(data.id, {
        routine_activities: data.routine_activities,
        preferred_reminder_style: data.preferred_reminder_style,
        adaptation_notes: data.adaptation_notes
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', patientProfileId] });
      toast.success('Routine updated!');
    },
    onError: () => {
      toast.error('Failed to update routine');
    }
  });

  const handleAddActivity = (routineId) => {
    if (!newActivity.trim()) return;

    const routine = routines.find(r => r.id === routineId);
    const updated = {
      ...routine,
      routine_activities: [
        ...routine.routine_activities,
        {
          activity: newActivity,
          scheduled_time: '09:00',
          reminder_minutes_before: 5,
          gentle_prompt: `Time for ${newActivity}`,
          duration_minutes: 30,
          flexibility_minutes: 15
        }
      ]
    };

    updateRoutine.mutate({ id: routineId, ...updated });
    setNewActivity('');
  };

  const handleRemoveActivity = (routineId, activityName) => {
    const routine = routines.find(r => r.id === routineId);
    const updated = {
      ...routine,
      routine_activities: routine.routine_activities.filter(a => a.activity !== activityName)
    };

    updateRoutine.mutate({ id: routineId, ...updated });
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading routines...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Daily Routines for {patientName}</h2>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Routine
        </Button>
      </div>

      {/* Routine Selection */}
      {routines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map(routine => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedRoutine(routine)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedRoutine?.id === routine.id
                  ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
              }`}
            >
              <h3 className="font-bold text-lg">{routine.routine_name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {routine.routine_activities.length} activities
              </p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2">
                Adherence: {routine.adherence_rate}%
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selected Routine Details */}
      {selectedRoutine && (
        <Card className="p-6 dark:bg-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{selectedRoutine.routine_name}</h3>
            
            <div className="flex gap-2">
              <Button
                onClick={() => adaptRoutine.mutate(selectedRoutine.id)}
                disabled={adaptRoutine.isPending}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {adaptRoutine.isPending ? 'Adapting...' : 'Adapt Now'}
              </Button>
            </div>
          </div>

          {/* Activities List */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-slate-900 dark:text-white">Activities</h4>
            
            {selectedRoutine.routine_activities.map((activity, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {activity.activity}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    ⏰ {activity.scheduled_time} • ⏱️ {activity.duration_minutes} min
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    📢 {activity.gentle_prompt}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Reminder {activity.reminder_minutes_before} min before • Flexibility: ±{activity.flexibility_minutes} min
                  </p>
                </div>
                
                <Button
                  onClick={() => handleRemoveActivity(selectedRoutine.id, activity.activity)}
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Add Activity Form */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Add new activity (e.g., breakfast, medication, walk)"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddActivity(selectedRoutine.id)}
            />
            <Button 
              onClick={() => handleAddActivity(selectedRoutine.id)}
              disabled={!newActivity.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          {/* Adaptation Notes */}
          {selectedRoutine.adaptation_notes && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg mb-6"
            >
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <TrendingUp className="inline w-4 h-4 mr-2" />
                {selectedRoutine.adaptation_notes}
              </p>
            </motion.div>
          )}

          {/* Adherence Insights */}
          {selectedRoutine.adherence_rate > 0 && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Overall Adherence</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {selectedRoutine.adherence_rate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Days Tracked</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedRoutine.days_tracked}
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* New Routine Form */}
      {showForm && (
        <Card className="p-6 dark:bg-slate-800 border-2 border-blue-500">
          <h3 className="text-xl font-bold mb-4">Create New Routine</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Routine Name</label>
              <Input placeholder="e.g., Morning Routine, Evening Care" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Reminder Style</label>
              <select className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600">
                <option value="gentle">Gentle & Warm</option>
                <option value="cheerful">Cheerful & Upbeat</option>
                <option value="calm">Calm & Peaceful</option>
                <option value="simple">Simple & Direct</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  createRoutine.mutate({
                    patient_profile_id: patientProfileId,
                    routine_name: 'New Routine',
                    routine_activities: [],
                    preferred_reminder_style: 'gentle'
                  });
                }}
                className="flex-1"
              >
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}