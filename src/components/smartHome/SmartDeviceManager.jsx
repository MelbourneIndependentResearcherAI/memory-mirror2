import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Lightbulb, Thermometer, Lock, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const DEVICE_ICONS = {
  light: Lightbulb,
  thermostat: Thermometer,
  door_lock: Lock,
  camera: Camera
};

export default function SmartDeviceManager() {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    device_type: 'light',
    brand: '',
    location: '',
    device_id: '',
    api_endpoint: '',
    api_key_reference: ''
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const fetchedDevices = await base44.entities.SmartDevice.list();
      setDevices(fetchedDevices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async () => {
    if (!newDevice.name || !newDevice.device_id) {
      alert('Please fill in required fields');
      return;
    }

    try {
      await base44.entities.SmartDevice.create(newDevice);
      setNewDevice({
        name: '',
        device_type: 'light',
        brand: '',
        location: '',
        device_id: '',
        api_endpoint: '',
        api_key_reference: ''
      });
      setShowAddForm(false);
      loadDevices();
    } catch (error) {
      console.error('Failed to add device:', error);
      alert('Failed to add device');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (confirm('Are you sure you want to remove this device?')) {
      try {
        await base44.entities.SmartDevice.delete(deviceId);
        loadDevices();
      } catch (error) {
        console.error('Failed to delete device:', error);
        alert('Failed to delete device');
      }
    }
  };

  const handleToggleActive = async (device) => {
    try {
      await base44.entities.SmartDevice.update(device.id, {
        is_active: !device.is_active
      });
      loadDevices();
    } catch (error) {
      console.error('Failed to toggle device:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Smart Devices</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </div>

      {/* Add Device Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Device Name"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                className="border-slate-300 dark:border-slate-600"
              />
              <select
                value={newDevice.device_type}
                onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 dark:bg-slate-700 dark:text-white"
              >
                <option value="light">Smart Light</option>
                <option value="thermostat">Thermostat</option>
                <option value="door_lock">Door Lock</option>
                <option value="camera">Camera</option>
                <option value="plug">Smart Plug</option>
              </select>
              <Input
                placeholder="Brand"
                value={newDevice.brand}
                onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
              />
              <Input
                placeholder="Location (e.g., Living Room)"
                value={newDevice.location}
                onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
              />
              <Input
                placeholder="Device ID"
                value={newDevice.device_id}
                onChange={(e) => setNewDevice({ ...newDevice, device_id: e.target.value })}
              />
              <Input
                placeholder="API Endpoint"
                value={newDevice.api_endpoint}
                onChange={(e) => setNewDevice({ ...newDevice, api_endpoint: e.target.value })}
              />
              <Input
                placeholder="API Key Reference (env var name)"
                value={newDevice.api_key_reference}
                onChange={(e) => setNewDevice({ ...newDevice, api_key_reference: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddDevice} className="bg-green-600 hover:bg-green-700">
                Add Device
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Device List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {devices.map((device) => {
            const IconComponent = DEVICE_ICONS[device.device_type] || Lightbulb;
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-xl p-4 border-2 transition-all ${
                  device.is_active
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-6 h-6 ${device.is_active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{device.name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {device.location && `${device.location} • `}
                        {device.brand}
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${device.is_active ? 'bg-green-500' : 'bg-slate-400'}`} />
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 space-y-1">
                  <p>Type: {device.device_type}</p>
                  {device.current_state && (
                    <p>Status: {JSON.stringify(device.current_state)}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(device)}
                    className="flex-1"
                  >
                    {device.is_active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {devices.length === 0 && !showAddForm && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Lightbulb className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400">No smart devices configured yet</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">Add your first device to get started</p>
        </div>
      )}
    </div>
  );
}