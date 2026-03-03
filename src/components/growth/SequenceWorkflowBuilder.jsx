import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/components/utils/supabaseClient';
import { toast } from 'sonner';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function SequenceWorkflowBuilder() {
  const [sequences, setSequences] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'nurture',
    target_audience: 'caregiver',
    is_active: true,
    steps: []
  });
  const [loading, setLoading] = useState(false);
  const [showNewSequence, setShowNewSequence] = useState(false);

  const sequenceTypes = ['nurture', 're_engagement', 'onboarding', 'custom'];
  const audiences = ['caregiver', 'provider', 'family_member'];
  const conditionTypes = ['email_opened', 'link_clicked', 'no_engagement', 'any'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [seqRes, tempRes] = await Promise.all([
        supabase.from('AutomatedSequence').select('*').order('created_date', { ascending: false }),
        supabase.from('OutreachTemplate').select('id, name, channel').eq('is_active', true)
      ]);

      if (seqRes.error) throw seqRes.error;
      if (tempRes.error) throw tempRes.error;

      setSequences(seqRes.data || []);
      setTemplates(tempRes.data || []);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  const addStep = () => {
    const newStep = {
      step_number: formData.steps.length + 1,
      template_id: '',
      delay_days: 3,
      condition: { type: 'any', from_previous_step: false },
      enable_ab_testing: false
    };
    setFormData({
      ...formData,
      steps: [...formData.steps, newStep]
    });
  };

  const updateStep = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setFormData({
      ...formData,
      steps: updatedSteps
    });
  };

  const updateStepCondition = (index, conditionField, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index].condition = {
      ...updatedSteps[index].condition,
      [conditionField]: value
    };
    setFormData({
      ...formData,
      steps: updatedSteps
    });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const moveStep = (index, direction) => {
    const newSteps = [...formData.steps];
    if (direction === 'up' && index > 0) {
      [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }
    newSteps.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setFormData({
      ...formData,
      steps: newSteps
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.steps.length === 0) {
      toast.error('Add at least one step');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('AutomatedSequence')
        .insert({
          ...formData,
          created_by: (await supabase.auth.getUser()).data.user?.email,
          stats: {
            total_sent: 0,
            total_opened: 0,
            total_clicked: 0,
            total_conversions: 0,
            conversion_rate: 0
          }
        });

      if (error) throw error;
      toast.success('Sequence created');
      setFormData({
        name: '',
        description: '',
        type: 'nurture',
        target_audience: 'caregiver',
        is_active: true,
        steps: []
      });
      setShowNewSequence(false);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showNewSequence ? (
        <Button onClick={() => setShowNewSequence(true)} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Create New Sequence
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create Follow-up Sequence</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Sequence Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sequenceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={formData.target_audience} onValueChange={(val) => setFormData({ ...formData, target_audience: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Workflow Steps</h3>
                {formData.steps.map((step, idx) => (
                  <Card key={idx} className="mb-3 p-4 bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm">Step {step.step_number}</span>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(idx, 'up')}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(idx, 'down')}
                            disabled={idx === formData.steps.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(idx)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      <Select value={step.template_id} onValueChange={(val) => updateStep(idx, 'template_id', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <div>
                        <label className="text-xs font-semibold">Delay (days)</label>
                        <Input
                          type="number"
                          min="0"
                          value={step.delay_days}
                          onChange={(e) => updateStep(idx, 'delay_days', parseInt(e.target.value))}
                        />
                      </div>

                      {idx > 0 && (
                        <>
                          <Select value={step.condition.type} onValueChange={(val) => updateStepCondition(idx, 'type', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Condition Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {conditionTypes.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={step.enable_ab_testing}
                              onChange={(e) => updateStep(idx, 'enable_ab_testing', e.target.checked)}
                            />
                            Enable A/B Testing
                          </label>
                        </>
                      )}
                    </div>
                  </Card>
                ))}

                <Button type="button" onClick={addStep} variant="outline" className="w-full">
                  Add Step
                </Button>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Sequence'}
                </Button>
                <Button type="button" onClick={() => setShowNewSequence(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Active Sequences</h3>
        {sequences.map((seq) => (
          <Card key={seq.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{seq.name}</span>
                <span className="text-xs bg-blue-100 px-2 py-1 rounded">{seq.steps?.length} steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">{seq.description}</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Sent</p>
                  <p className="font-semibold">{seq.stats?.total_sent || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Opened</p>
                  <p className="font-semibold">{seq.stats?.total_opened || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Clicked</p>
                  <p className="font-semibold">{seq.stats?.total_clicked || 0}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Conv. Rate</p>
                  <p className="font-semibold">{seq.stats?.conversion_rate || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}