import React, { useState, useEffect } from 'react';
import { X, Lock, Plus, Trash2, Bell, BellOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEFAULT_PIN = '1234';
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AlarmManagerModal({ onClose }) {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');
  const [newDays, setNewDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('carerAlarms');
      setAlarms(saved ? JSON.parse(saved) : []);
    } catch { setAlarms([]); }
  }, []);

  const saveAlarms = (updated) => {
    setAlarms(updated);
    localStorage.setItem('carerAlarms', JSON.stringify(updated));
  };

  const checkPin = () => {
    const storedPin = localStorage.getItem('carerClockPin') || DEFAULT_PIN;
    if (pinInput === storedPin) {
      setUnlocked(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default is 1234.');
    }
  };

  const addAlarm = () => {
    if (!newTime) return;
    const alarm = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel.trim(),
      days: newDays,
      enabled: true,
    };
    saveAlarms([...alarms, alarm].sort((a, b) => a.time.localeCompare(b.time)));
    setNewLabel('');
    setNewTime('08:00');
    setNewDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const toggleAlarm = (id) => {
    saveAlarms(alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlarm = (id) => {
    saveAlarms(alarms.filter(a => a.id !== id));
  };

  const toggleDay = (day) => {
    setNewDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const [changingPin, setChangingPin] = useState(false);
  const [newPin1, setNewPin1] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  const saveNewPin = () => {
    if (newPin1.length < 4) { setPinChangeMsg('PIN must be at least 4 digits.'); return; }
    if (newPin1 !== newPin2) { setPinChangeMsg('PINs do not match.'); return; }
    localStorage.setItem('carerClockPin', newPin1);
    setPinChangeMsg('PIN updated!');
    setChangingPin(false);
    setNewPin1(''); setNewPin2('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <Lock className="w-5 h-5" />
            <span className="text-xl font-bold">Carer Alarm Settings</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {!unlocked ? (
            /* PIN Screen */
            <div className="flex flex-col items-center gap-4 py-6">
              <Lock className="w-16 h-16 text-purple-500" />
              <p className="text-lg font-semibold text-slate-800 dark:text-white">Enter Carer PIN</p>
              <p className="text-sm text-slate-500">Default PIN: 1234</p>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkPin()}
                className="text-center text-2xl tracking-widest w-40"
                maxLength={8}
              />
              {pinError && <p className="text-red-500 text-sm">{pinError}</p>}
              <Button onClick={checkPin} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                Unlock
              </Button>
            </div>
          ) : (
            /* Alarm Manager */
            <div className="space-y-6">
              {/* Add New Alarm */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
                <p className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-500" /> Add New Alarm
                </p>
                <div className="flex gap-3">
                  <Input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="text-2xl font-bold w-36"
                  />
                  <Input
                    placeholder="Label (e.g. Medication)"
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    className="flex-1"
                  />
                </div>
                {/* Day picker */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Repeat on days:</p>
                  <div className="flex gap-1 flex-wrap">
                    {DAY_NAMES.map((d, i) => (
                      <button
                        key={d}
                        onClick={() => toggleDay(i)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          newDays.includes(i)
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={addAlarm} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Alarm
                </Button>
              </div>

              {/* Existing Alarms */}
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Alarms ({alarms.length})</p>
                {alarms.length === 0 && (
                  <p className="text-center text-slate-400 py-4">No alarms set</p>
                )}
                {alarms.map(alarm => (
                  <div key={alarm.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className={`text-2xl font-bold ${alarm.enabled ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {alarm.time}
                      </p>
                      {alarm.label && <p className="text-sm text-slate-500">{alarm.label}</p>}
                      <p className="text-xs text-slate-400">
                        {alarm.days && alarm.days.length > 0 && alarm.days.length < 7
                          ? alarm.days.map(d => DAY_NAMES[d]).join(', ')
                          : 'Every day'}
                      </p>
                    </div>
                    <button onClick={() => toggleAlarm(alarm.id)} className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      {alarm.enabled
                        ? <Bell className="w-5 h-5 text-yellow-500" />
                        : <BellOff className="w-5 h-5 text-slate-400" />}
                    </button>
                    <button onClick={() => deleteAlarm(alarm.id)} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Change PIN */}
              <div className="border-t pt-4 dark:border-slate-700">
                {!changingPin ? (
                  <button onClick={() => setChangingPin(true)} className="text-sm text-purple-600 hover:underline">
                    Change Carer PIN
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Set New PIN</p>
                    <Input type="password" inputMode="numeric" placeholder="New PIN" value={newPin1} onChange={e => setNewPin1(e.target.value)} maxLength={8} />
                    <Input type="password" inputMode="numeric" placeholder="Confirm PIN" value={newPin2} onChange={e => setNewPin2(e.target.value)} maxLength={8} />
                    {pinChangeMsg && <p className={`text-sm ${pinChangeMsg.includes('updated') ? 'text-green-600' : 'text-red-500'}`}>{pinChangeMsg}</p>}
                    <div className="flex gap-2">
                      <Button onClick={saveNewPin} className="flex-1 bg-purple-600 text-white"><Check className="w-4 h-4 mr-1" /> Save</Button>
                      <Button variant="outline" onClick={() => setChangingPin(false)} className="flex-1">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}