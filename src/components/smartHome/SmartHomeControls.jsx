import React, { useState, useEffect } from 'react';
import { Lightbulb, Lock, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function SmartHomeControls({ mode = 'compact' }) {
  const [devices, setDevices] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [executing, setExecuting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [devicesList, routinesList] = await Promise.all([
        base44.entities.SmartDevice.list(),
        base44.entities.SmartHomeRoutine.list()
      ]);
      setDevices(devicesList.filter(d => d.is_active));
      setRoutines(routinesList.filter(r => r.is_active));
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (device, action) => {
    setExecuting(`${device.id}-${action}`);
    try {
      await base44.functions.invoke('controlSmartDevice', {
        device_id: device.device_id,
        action,
        parameters: {}
      });
      loadData();
    } catch (error) {
      console.error('Failed to execute action:', error);
    } finally {
      setExecuting(null);
    }
  };

  const handleExecuteRoutine = async (routine) => {
    setExecuting(routine.id);
    try {
      await base44.functions.invoke('executeSmartHomeRoutine', {
        routine_id: routine.id
      });
      loadData();
    } catch (error) {
      console.error('Failed to execute routine:', error);
    } finally {
      setExecuting(null);
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Quick Device Actions */}
      {devices.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Quick Controls
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <AnimatePresence>
              {devices.map((device) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  {device.device_type === 'light' && (
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(device, 'on')}
                        disabled={executing === `${device.id}-on`}
                        className="w-full gap-1"
                      >
                        {executing === `${device.id}-on` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Lightbulb className="w-3 h-3" />
                        )}
                        On
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAction(device, 'off')}
                        disabled={executing === `${device.id}-off`}
                        className="w-full gap-1"
                      >
                        {executing === `${device.id}-off` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Lightbulb className="w-3 h-3 opacity-50" />
                        )}
                        Off
                      </Button>
                    </div>
                  )}

                  {device.device_type === 'door_lock' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAction(device, 'lock')}
                      disabled={executing === `${device.id}-lock`}
                      className="w-full gap-1"
                    >
                      {executing === `${device.id}-lock` ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      Lock
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Routines */}
      {routines.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Routines
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {routines.map((routine) => (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Button
                    size="sm"
                    onClick={() => handleExecuteRoutine(routine)}
                    disabled={executing === routine.id}
                    className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    {executing === routine.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    {routine.name}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {devices.length === 0 && routines.length === 0 && (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No smart devices or routines available
          </p>
        </div>
      )}
    </div>
  );
}