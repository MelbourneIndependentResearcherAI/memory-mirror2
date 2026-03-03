import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/components/utils/supabaseClient';
import { toast } from 'sonner';

export default function OutreachTemplateBuilder() {
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    audience: 'caregiver',
    campaign_objective: 'trial_signup',
    lead_source: [],
    subject_line: '',
    body: '',
    cta_text: 'Get Started',
    cta_url: '',
    is_active: true
  });

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const channels = ['email', 'sms', 'push_notification'];
  const audiences = ['caregiver', 'provider', 'family_member'];
  const objectives = ['trial_signup', 'feature_announcement', 'feedback_request', 'product_launch', 'educational'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('OutreachTemplate')
        .insert({
          ...formData,
          created_by: (await supabase.auth.getUser()).data.user?.email
        });

      if (error) throw error;
      toast.success('Template created successfully');
      setFormData({
        name: '',
        channel: 'email',
        audience: 'caregiver',
        campaign_objective: 'trial_signup',
        lead_source: [],
        subject_line: '',
        body: '',
        cta_text: 'Get Started',
        cta_url: '',
        is_active: true
      });
      fetchTemplates();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('OutreachTemplate')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      toast.error('Failed to load templates');
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Outreach Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Select value={formData.channel} onValueChange={(val) => setFormData({ ...formData, channel: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((ch) => <SelectItem key={ch} value={ch}>{ch}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={formData.audience} onValueChange={(val) => setFormData({ ...formData, audience: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((aud) => <SelectItem key={aud} value={aud}>{aud}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={formData.campaign_objective} onValueChange={(val) => setFormData({ ...formData, campaign_objective: val })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {objectives.map((obj) => <SelectItem key={obj} value={obj}>{obj}</SelectItem>)}
              </SelectContent>
            </Select>

            {formData.channel === 'email' && (
              <Textarea
                placeholder="Subject Line (use {{name}}, {{email}}, {{source}} for personalization)"
                value={formData.subject_line}
                onChange={(e) => setFormData({ ...formData, subject_line: e.target.value })}
              />
            )}

            <Textarea
              placeholder="Message Body (use {{name}}, {{email}}, {{source}}, {{role}} for personalization)"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={6}
              required
            />

            <Input
              placeholder="CTA Button Text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
            />

            <Input
              placeholder="CTA URL (use {{email}} if needed)"
              value={formData.cta_url}
              onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Template'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Existing Templates</h3>
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between items-center">
                <span>{template.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{template.channel}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2"><strong>Audience:</strong> {template.audience}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Objective:</strong> {template.campaign_objective}</p>
              <p className="text-sm text-gray-700">{template.body.substring(0, 100)}...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}