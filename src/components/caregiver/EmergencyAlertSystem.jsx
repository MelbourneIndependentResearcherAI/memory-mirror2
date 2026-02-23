import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Shield,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import EmergencyContactsManager from './EmergencyContactsManager';

export default function EmergencyAlertSystem() {
  const [showForm, setShowForm] = useState(false);
  const [editingCondition, setEditingCondition] = useState(null);
  const [formData, setFormData] = useState({
    condition_name: '',
    condition_type: 'no_interaction',
    threshold_value: 2,
    threshold_unit: 'hours',
    is_enabled: true,
    notify_contacts: [],
    notification_method: ['email', 'app_notification'],
    severity: 'medium',
    cooldown_minutes: 30
  });

  const queryClient = useQueryClient();

  const { data: conditions = [] } = useQuery({
    queryKey: ['alertConditions'],
    queryFn: () => base44.entities.AlertCondition.list(),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['emergencyContacts'],
    queryFn: () => base44.entities.EmergencyContact.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AlertCondition.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      toast.success('Alert condition created successfully');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to create alert condition');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AlertCondition.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      toast.success('Alert condition updated');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AlertCondition.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConditions'] });
      toast.success('Alert condition deleted');
    },
  });

  const resetForm = () => {
    setFormData({
      condition_name: '',
      condition_type: 'no_interaction',
      threshold_value: 2,
      threshold_unit: 'hours',
      is_enabled: true,
      notify_contacts: [],
      notification_method: ['email', 'app_notification'],
      severity: 'medium',
      cooldown_minutes: 30
    });
    setEditingCondition(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCondition) {
      updateMutation.mutate({ id: editingCondition.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (condition) => {
    setFormData({
      condition_name: condition.condition_name,
      condition_type: condition.condition_type,
      threshold_value: condition.threshold_value,
      threshold_unit: condition.threshold_unit || 'hours',
      is_enabled: condition.is_enabled,
      notify_contacts: condition.notify_contacts || [],
      notification_method: condition.notification_method || ['email', 'app_notification'],
      severity: condition.severity || 'medium',
      cooldown_minutes: condition.cooldown_minutes || 30
    });
    setEditingCondition(condition);
    setShowForm(true);
  };

  const conditionTypeLabels = {
    prolonged_distress: 'Prolonged Distress',
    no_interaction: 'No Interaction',
    high_anxiety: 'High Anxiety Level',
    repeated_confusion: 'Repeated Confusion',
    night_incident: 'Night Incident',
    exit_attempt: 'Exit Attempt',
    fall_detected: 'Fall Detected',
    custom: 'Custom Condition'
  };

  const severityColors = {
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="conditions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conditions">Alert Conditions</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="conditions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-blue-600" />
                    Alert Conditions
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Set up automated alerts when specific conditions are detected
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowForm(!showForm)}
                  className="min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Condition
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {contacts.length === 0 && (
                <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-slate-700 dark:text-slate-300">
                    <strong>No emergency contacts configured.</strong> Switch to the "Emergency Contacts" tab to add contacts before setting up alert conditions.
                  </AlertDescription>
                </Alert>
              )}

              {showForm && (
                <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl mb-6 space-y-6 border-2 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {editingCondition ? 'Edit Alert Condition' : 'New Alert Condition'}
                    </h3>
                    <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition_name">Condition Name *</Label>
                      <Input
                        id="condition_name"
                        value={formData.condition_name}
                        onChange={(e) => setFormData({ ...formData, condition_name: e.target.value })}
                        placeholder="e.g., Check for inactivity"
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="condition_type">Condition Type *</Label>
                      <Select
                        value={formData.condition_type}
                        onValueChange={(value) => setFormData({ ...formData, condition_type: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(conditionTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="threshold_value">Threshold Value *</Label>
                      <Input
                        id="threshold_value"
                        type="number"
                        value={formData.threshold_value}
                        onChange={(e) => setFormData({ ...formData, threshold_value: parseFloat(e.target.value) })}
                        required
                        min="0"
                        step="0.5"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="threshold_unit">Threshold Unit</Label>
                      <Select
                        value={formData.threshold_unit}
                        onValueChange={(value) => setFormData({ ...formData, threshold_unit: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="level">Level (0-10)</SelectItem>
                          <SelectItem value="occurrences">Occurrences</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="severity">Severity Level</Label>
                      <Select
                        value={formData.severity}
                        onValueChange={(value) => setFormData({ ...formData, severity: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cooldown">Cooldown (minutes)</Label>
                      <Input
                        id="cooldown"
                        type="number"
                        value={formData.cooldown_minutes}
                        onChange={(e) => setFormData({ ...formData, cooldown_minutes: parseInt(e.target.value) })}
                        min="5"
                        className="mt-1"
                      />
                      <p className="text-xs text-slate-500 mt-1">Wait time before re-alerting</p>
                    </div>
                  </div>

                  <div>
                    <Label>Notify These Contacts</Label>
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {contacts.length === 0 ? (
                        <p className="text-sm text-slate-500">No contacts available</p>
                      ) : (
                        contacts.map((contact) => (
                          <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.notify_contacts.includes(contact.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    notify_contacts: [...formData.notify_contacts, contact.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    notify_contacts: formData.notify_contacts.filter(id => id !== contact.id)
                                  });
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-2xl">{contact.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{contact.name}</p>
                              <p className="text-xs text-slate-500">{contact.phone}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Notification Methods</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {[
                        { value: 'email', label: 'Email', icon: Mail },
                        { value: 'sms', label: 'SMS', icon: MessageSquare },
                        { value: 'phone_call', label: 'Phone Call', icon: Phone },
                        { value: 'app_notification', label: 'App Notification', icon: Bell }
                      ].map(({ value, label, icon: Icon }) => (
                        <label key={value} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notification_method.includes(value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  notification_method: [...formData.notification_method, value]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  notification_method: formData.notification_method.filter(m => m !== value)
                                });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Enable This Alert</p>
                        <p className="text-xs text-slate-500">Alert will be active immediately</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 h-12">
                      <Save className="w-4 h-4 mr-2" />
                      {editingCondition ? 'Update Condition' : 'Create Condition'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="h-12">
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Active Conditions List */}
              <div className="space-y-4">
                {conditions.length === 0 && !showForm ? (
                  <div className="text-center py-12 text-slate-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No alert conditions configured yet.</p>
                    <p className="text-sm">Add your first condition to start monitoring.</p>
                  </div>
                ) : (
                  conditions.map((condition) => (
                    <Card key={condition.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {condition.condition_name}
                              </h3>
                              <Badge className={severityColors[condition.severity]}>
                                {condition.severity}
                              </Badge>
                              {!condition.is_enabled && (
                                <Badge variant="outline" className="text-slate-500">
                                  Disabled
                                </Badge>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{conditionTypeLabels[condition.condition_type]}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>Threshold: {condition.threshold_value} {condition.threshold_unit}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Users className="w-4 h-4" />
                                <span>{condition.notify_contacts?.length || 0} contacts</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Bell className="w-4 h-4" />
                                <span>{condition.notification_method?.length || 0} notification methods</span>
                              </div>
                            </div>

                            {condition.last_triggered && (
                              <p className="text-xs text-slate-500 mt-3">
                                Last triggered: {new Date(condition.last_triggered).toLocaleString()}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(condition)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Delete this alert condition?')) {
                                  deleteMutation.mutate(condition.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <EmergencyContactsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}