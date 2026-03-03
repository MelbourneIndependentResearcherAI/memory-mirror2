import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/components/utils/supabaseClient';
import { toast } from 'sonner';

export default function ABTestManager() {
  const [tests, setTests] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    test_name: '',
    template_id: '',
    variant_type: 'subject_line',
    variant_a_value: '',
    variant_b_value: '',
    split_ratio: 50
  });
  const [loading, setLoading] = useState(false);

  const variantTypes = ['subject_line', 'body', 'cta_text', 'full_message'];

  useEffect(() => {
    fetchTemplates();
    fetchTests();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('OutreachTemplate')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      toast.error('Failed to load templates');
    }
  };

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ABTestVariant')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (err) {
      toast.error('Failed to load tests');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('ABTestVariant')
        .insert({
          ...formData,
          status: 'draft',
          metrics: {
            variant_a_sent: 0,
            variant_a_opens: 0,
            variant_a_clicks: 0,
            variant_a_conversions: 0,
            variant_b_sent: 0,
            variant_b_opens: 0,
            variant_b_clicks: 0,
            variant_b_conversions: 0
          }
        });

      if (error) throw error;
      toast.success('A/B test created');
      setFormData({
        test_name: '',
        template_id: '',
        variant_type: 'subject_line',
        variant_a_value: '',
        variant_b_value: '',
        split_ratio: 50
      });
      fetchTests();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId) => {
    try {
      const { error } = await supabase
        .from('ABTestVariant')
        .update({ status: 'running', start_date: new Date().toISOString() })
        .eq('id', testId);

      if (error) throw error;
      toast.success('Test started');
      fetchTests();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getWinRate = (metric) => {
    if (metric.variant_a_sent === 0) return 0;
    return ((metric.variant_a_clicks / metric.variant_a_sent) * 100).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create A/B Test</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Test Name"
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              required
            />

            <Select value={formData.template_id} onValueChange={(val) => setFormData({ ...formData, template_id: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formData.variant_type} onValueChange={(val) => setFormData({ ...formData, variant_type: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {variantTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>

            <div>
              <label className="text-sm font-semibold mb-2 block">Variant A</label>
              {formData.variant_type === 'body' ? (
                <Textarea
                  placeholder="Variant A Content"
                  value={formData.variant_a_value}
                  onChange={(e) => setFormData({ ...formData, variant_a_value: e.target.value })}
                  rows={4}
                  required
                />
              ) : (
                <Input
                  placeholder="Variant A Content"
                  value={formData.variant_a_value}
                  onChange={(e) => setFormData({ ...formData, variant_a_value: e.target.value })}
                  required
                />
              )}
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Variant B</label>
              {formData.variant_type === 'body' ? (
                <Textarea
                  placeholder="Variant B Content"
                  value={formData.variant_b_value}
                  onChange={(e) => setFormData({ ...formData, variant_b_value: e.target.value })}
                  rows={4}
                  required
                />
              ) : (
                <Input
                  placeholder="Variant B Content"
                  value={formData.variant_b_value}
                  onChange={(e) => setFormData({ ...formData, variant_b_value: e.target.value })}
                  required
                />
              )}
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Split Ratio (% for Variant A): {formData.split_ratio}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.split_ratio}
                onChange={(e) => setFormData({ ...formData, split_ratio: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create A/B Test'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Active Tests</h3>
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{test.test_name}</span>
                <span className={`text-xs px-2 py-1 rounded ${test.status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                  {test.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600"><strong>Type:</strong> {test.variant_type}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="font-semibold">Variant A</p>
                  <p className="text-gray-700">{test.variant_a_value.substring(0, 50)}...</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="font-semibold">Variant B</p>
                  <p className="text-gray-700">{test.variant_b_value.substring(0, 50)}...</p>
                </div>
              </div>
              {test.status === 'draft' && (
                <Button onClick={() => startTest(test.id)} className="w-full">
                  Start Test
                </Button>
              )}
              {test.status === 'running' && (
                <div className="bg-green-50 p-3 rounded text-sm">
                  <p className="text-green-800">✓ Test running - {test.split_ratio}% A / {100 - test.split_ratio}% B</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}