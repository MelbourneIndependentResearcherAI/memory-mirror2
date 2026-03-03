import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/components/utils/supabaseClient';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Zap, TrendingUp } from 'lucide-react';

export default function SequencePerformance() {
  const [sequences, setSequences] = useState([]);
  const [selectedSequence, setSelectedSequence] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [optimizing, setOptimizing] = useState(false);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      const { data, error } = await supabase
        .from('AutomatedSequence')
        .select('*')
        .eq('is_active', true)
        .order('created_date', { ascending: false });

      if (error) throw error;
      setSequences(data || []);
      if (data?.length > 0) {
        setSelectedSequence(data[0]);
        fetchEnrollments(data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load sequences');
    }
  };

  const fetchEnrollments = async (sequenceId) => {
    try {
      const { data, error } = await supabase
        .from('SequenceEnrollment')
        .select('*')
        .eq('sequence_id', sequenceId);

      if (error) throw error;
      setEnrollments(data || []);
    } catch (err) {
      toast.error('Failed to load enrollments');
    }
  };

  const optimizeSequence = async () => {
    if (!selectedSequence) return;

    setOptimizing(true);
    try {
      const response = await base44.functions.invoke('optimizeSequenceFromABTests', {
        sequenceId: selectedSequence.id
      });

      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations);
        toast.success(`Found ${response.data.recommendations.length} optimization opportunities`);
      }
    } catch (err) {
      toast.error('Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const getEnrollmentStats = () => {
    const stats = {
      total: enrollments.length,
      active: enrollments.filter(e => e.status === 'active').length,
      completed: enrollments.filter(e => e.status === 'completed').length,
      paused: enrollments.filter(e => e.status === 'paused').length
    };
    return stats;
  };

  if (!selectedSequence) {
    return <div className="text-center py-8">No sequences found</div>;
  }

  const stats = getEnrollmentStats();

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {sequences.map((seq) => (
          <Button
            key={seq.id}
            variant={selectedSequence.id === seq.id ? 'default' : 'outline'}
            onClick={() => {
              setSelectedSequence(seq);
              fetchEnrollments(seq.id);
              setRecommendations([]);
            }}
          >
            {seq.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Conv. Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{selectedSequence.stats?.conversion_rate || 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Performance Metrics</span>
            <Button onClick={optimizeSequence} disabled={optimizing} size="sm">
              <Zap className="w-4 h-4 mr-2" />
              {optimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Sent</p>
              <p className="text-xl font-bold">{selectedSequence.stats?.total_sent || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Opened</p>
              <p className="text-xl font-bold">{selectedSequence.stats?.total_opened || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clicked</p>
              <p className="text-xl font-bold">{selectedSequence.stats?.total_clicked || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-blue-200">
                <p className="font-semibold text-sm">{rec.recommended_action}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Step {rec.step_number} • {rec.variant_type} • {rec.improvement_percentage}% improvement
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-auto">
            {enrollments.slice(0, 10).map((enrollment) => (
              <div key={enrollment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                <span className="font-mono">{enrollment.lead_email}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  enrollment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  Step {enrollment.current_step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}