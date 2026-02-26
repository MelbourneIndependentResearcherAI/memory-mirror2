import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function AlertConfigurationManager({ patientProfileId }) {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    condition_name: '',
    condition_type: 'high_anxiety',
    threshold_value: 5,
    threshold_unit: 'level',
    severity: 'medium',
    is_enabled: true,
    cooldown_minutes: 30,
    notification_method: ['email', 'app_notification']
  });

  const { data: conditions = [], isLoading } = useQuery({
    queryKey: ['alertConditions', patientProfileId],
    queryFn: async () => {
      const alerts = await base44.entities.AlertCondition.filter({ is_enabled: true }, '-created_date', 50);
      return alerts;
    },
    staleTime: 1000 * 60 * 5
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AlertCondition.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      setFormData({
        condition_name: '',
        condition_type: 'high_anxiety',
        threshold_value: 5,
        threshold_unit: 'level',
        severity: 'medium',
        is_enabled: true,
        cooldown_minutes: 30,
        notification_method: ['email', 'app_notification']
      });
      setIsAdding(false);
      toast.success('Alert condition created');
    },
    onError: () => toast.error('Failed to create condition')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AlertCondition.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      setEditingId(null);
      toast.success('Alert condition updated');
    },
    onError: () => toast.error('Failed to update condition')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AlertCondition.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      toast.success('Alert condition deleted');
    },
    onError: () => toast.error('Failed to delete condition')
  });

  const handleSubmit = () => {
    if (!formData.condition_name.trim()) {
      toast.error('Please enter a condition name');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (condition) => {
    setFormData(condition);
    setEditingId(condition.id);
  };

  const alertTypes = [
    { value: 'no_interaction', label: 'No Interaction (Inactivity)', unit: 'hours' },
    { value: 'high_anxiety', label: 'High Anxiety Level', unit: 'level' },
    { value: 'prolonged_distress', label: 'Prolonged Distress', unit: 'minutes' },
    { value: 'repeated_confusion', label: 'Repeated Confusion', unit: 'occurrences' },
    { value: 'exit_attempt', label: 'Exit Attempt Detected', unit: 'level' }
  ];

  const selectedType = alertTypes.find(t => t.value === formData.condition_type);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4">Alert Configuration</h3>
        
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="mb-6">
            <Plus className="w-4 h-4 mr-2" /> Add Alert Condition
          </Button>
        )}

        {(isAdding || editingId) && (
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Condition Name</label>
              <input
                type="text"
                value={formData.condition_name}
                onChange={(e) => setFormData({ ...formData, condition_name: e.target.value })}
                placeholder="e.g., Extended Inactivity Alert"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Alert Type</label>
                <select
                  value={formData.condition_type}
                  onChange={(e) => {
                    const type = alertTypes.find(t => t.value === e.target.value);
                    setFormData({
                      ...formData,
                      condition_type: e.target.value,
                      threshold_unit: type?.unit || 'level'
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                >
                  {alertTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Threshold</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData({ ...formData, threshold_value: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                  />
                  <span className="px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">
                    {selectedType?.unit || 'level'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cooldown (minutes)</label>
                <input
                  type="number"
                  value={formData.cooldown_minutes}
                  onChange={(e) => setFormData({ ...formData, cooldown_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} variant="default" className="flex-1">
                <Check className="w-4 h-4 mr-2" /> Save
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-slate-500">Loading conditions...</p>
        ) : conditions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No alert conditions configured yet</p>
        ) : (
          <div className="space-y-3">
            {conditions.map((condition) => (
              <div
                key={condition.id}
                className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{condition.condition_name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Trigger: {condition.threshold_value} {condition.threshold_unit} | 
                    Severity: <span className={`font-semibold ${
                      condition.severity === 'critical' ? 'text-red-600' :
                      condition.severity === 'high' ? 'text-orange-600' :
                      condition.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>{condition.severity}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(condition)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMutation.mutate(condition.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}