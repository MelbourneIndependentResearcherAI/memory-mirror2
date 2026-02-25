import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Zap, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function SmartHomeRoutineBuilder() {
  const [routines, setRoutines] = useState([]);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    trigger_type: 'manual',
    devices_and_actions: [],
    auto_mode_enabled: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [routinesList, devicesList] = await Promise.all([
        base44.entities.SmartHomeRoutine.list(),
        base44.entities.SmartDevice.list()
      ]);
      setRoutines(routinesList);
      setDevices(devicesList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAction = () => {
    setNewRoutine(prev => ({
      ...prev,
      devices_and_actions: [
        ...prev.devices_and_actions,
        { device_id: '', action: '', parameters: {}, delay_seconds: 0 }
      ]
    }));
  };

  const handleRemoveAction = (index) => {
    setNewRoutine(prev => ({
      ...prev,
      devices_and_actions: prev.devices_and_actions.filter((_, i) => i !== index)
    }));
  };

  const handleSaveRoutine = async () => {
    if (!newRoutine.name || newRoutine.devices_and_actions.length === 0) {
      alert('Routine name and at least one action required');
      return;
    }

    try {
      await base44.entities.SmartHomeRoutine.create(newRoutine);
      setNewRoutine({
        name: '',
        description: '',
        trigger_type: 'manual',
        devices_and_actions: [],
        auto_mode_enabled: false
      });
      setShowBuilder(false);
      loadData();
    } catch (error) {
      console.error('Failed to save routine:', error);
      alert('Failed to save routine');
    }
  };

  const handleExecuteRoutine = async (routineId) => {
    try {
      await base44.functions.invoke('executeSmartHomeRoutine', {
        routine_id: routineId,
        requires_confirmation: true
      });
      alert('Routine executed successfully');
      loadData();
    } catch (error) {
      console.error('Failed to execute routine:', error);
      alert('Failed to execute routine');
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (confirm('Delete this routine?')) {
      try {
        await base44.entities.SmartHomeRoutine.delete(routineId);
        loadData();
      } catch (error) {
        console.error('Failed to delete routine:', error);
      }
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Routines</h3>
        <Button
          onClick={() => setShowBuilder(!showBuilder)}
          className="gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Create Routine
        </Button>
      </div>

      {/* Routine Builder */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700 space-y-4"
          >
            <Input
              placeholder="Routine Name"
              value={newRoutine.name}
              onChange={(e) => setNewRoutine({ ...newRoutine, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
            />

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                When
              </label>
              <select
                value={newRoutine.trigger_type}
                onChange={(e) => setNewRoutine({ ...newRoutine, trigger_type: e.target.value })}
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
              >
                <option value="manual">Manual (User-triggered)</option>
                <option value="night_watch_activated">Night Watch Activated</option>
                <option value="mood_detected">Anxiety Detected</option>
                <option value="user_request">User Request</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Then
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddAction}
                  className="gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Action
                </Button>
              </div>

              <div className="space-y-3">
                {newRoutine.devices_and_actions.map((action, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg space-y-2">
                    <select
                      value={action.device_id}
                      onChange={(e) => {
                        const updated = [...newRoutine.devices_and_actions];
                        updated[idx].device_id = e.target.value;
                        setNewRoutine({ ...newRoutine, devices_and_actions: updated });
                      }}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:bg-slate-600 dark:text-white"
                    >
                      <option value="">Select Device</option>
                      {devices.map(device => (
                        <option key={device.id} value={device.id}>
                          {device.name} ({device.device_type})
                        </option>
                      ))}
                    </select>

                    <select
                      value={action.action}
                      onChange={(e) => {
                        const updated = [...newRoutine.devices_and_actions];
                        updated[idx].action = e.target.value;
                        setNewRoutine({ ...newRoutine, devices_and_actions: updated });
                      }}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:bg-slate-600 dark:text-white"
                    >
                      <option value="">Select Action</option>
                      <option value="on">Turn On</option>
                      <option value="off">Turn Off</option>
                      <option value="brightness">Set Brightness</option>
                      <option value="color">Set Color</option>
                      <option value="dim_comfort">Dim for Comfort</option>
                      <option value="lock">Lock</option>
                      <option value="unlock">Unlock</option>
                    </select>

                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Delay (seconds)"
                        type="number"
                        min="0"
                        value={action.delay_seconds}
                        onChange={(e) => {
                          const updated = [...newRoutine.devices_and_actions];
                          updated[idx].delay_seconds = parseInt(e.target.value) || 0;
                          setNewRoutine({ ...newRoutine, devices_and_actions: updated });
                        }}
                        className="w-32 text-sm"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveAction(idx)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newRoutine.auto_mode_enabled}
                onChange={(e) => setNewRoutine({ ...newRoutine, auto_mode_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Auto-execute without confirmation
              </span>
            </label>

            <div className="flex gap-3">
              <Button onClick={handleSaveRoutine} className="bg-green-600 hover:bg-green-700">
                Save Routine
              </Button>
              <Button variant="outline" onClick={() => setShowBuilder(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Routines List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {routines.map((routine) => (
            <motion.div
              key={routine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{routine.name}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{routine.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  {routine.auto_mode_enabled && (
                    <ToggleRight className="w-4 h-4 text-green-600" title="Auto-mode enabled" />
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p>Trigger: {routine.trigger_type}</p>
                <p>Actions: {routine.devices_and_actions.length}</p>
                <p>Executions: {routine.execution_count || 0}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleExecuteRoutine(routine.id)}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 gap-1"
                >
                  <Play className="w-3 h-3" />
                  Execute
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRoutine(routine.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {routines.length === 0 && !showBuilder && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Zap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No routines created yet</p>
        </div>
      )}
    </div>
  );
}