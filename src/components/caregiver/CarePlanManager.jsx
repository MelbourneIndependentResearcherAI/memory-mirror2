import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Edit, Trash2, Copy, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isPast, parseISO } from 'date-fns';

export default function CarePlanManager({ patientProfileId, onCreateNew, onView, onEdit }) {
  const queryClient = useQueryClient();

  const { data: carePlans = [], isLoading } = useQuery({
    queryKey: ['carePlans', patientProfileId],
    queryFn: () => base44.entities.CarePlan.filter({ patient_profile_id: patientProfileId })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CarePlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans', patientProfileId] });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (carePlan) => {
      const newPlan = { ...carePlan };
      delete newPlan.id;
      delete newPlan.created_date;
      delete newPlan.updated_date;
      newPlan.plan_title = `${carePlan.plan_title} (Copy)`;
      newPlan.status = 'inactive';
      return base44.entities.CarePlan.create(newPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans', patientProfileId] });
    }
  });

  const activePlans = carePlans.filter(p => p.status === 'active');
  const inactivePlans = carePlans.filter(p => p.status !== 'active');

  const isReviewDue = (nextReviewDate) => {
    return nextReviewDate && isPast(parseISO(nextReviewDate));
  };

  const PlanCard = ({ plan, isOverdue }) => (
    <Card className={isOverdue ? 'border-red-300 bg-red-50' : ''}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{plan.plan_title}</CardTitle>
            <CardDescription>{plan.patient_name}</CardDescription>
          </div>
          <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {plan.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOverdue && (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Review is overdue</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Review Frequency</p>
            <p className="font-semibold capitalize">{plan.review_frequency}</p>
          </div>
          <div>
            <p className="text-gray-600">Next Review</p>
            <p className="font-semibold">{plan.next_review_date ? format(new Date(plan.next_review_date), 'MMM dd') : 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600">Last Reviewed</p>
            <p className="font-semibold">{plan.last_reviewed ? format(new Date(plan.last_reviewed), 'MMM dd') : 'Never'}</p>
          </div>
          <div>
            <p className="text-gray-600">Sections</p>
            <p className="font-semibold">{
              [
                plan.daily_routines?.length > 0 ? '1' : '',
                plan.medical_history?.medications?.length > 0 ? '1' : '',
                plan.emergency_contacts?.length > 0 ? '1' : '',
                plan.care_instructions?.length > 0 ? '1' : ''
              ].filter(Boolean).length
            }/4</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(plan)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(plan)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateMutation.mutate(plan)}
            disabled={duplicateMutation.isPending}
            className="gap-2"
          >
            <Copy className="w-4 h-4" /> Copy
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate(plan.id)}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading care plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Care Plans</h2>
          <p className="text-gray-600">{activePlans.length} active {activePlans.length === 1 ? 'plan' : 'plans'}</p>
        </div>
        <Button onClick={onCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> New Care Plan
        </Button>
      </div>

      {activePlans.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 text-lg">Active Plans</h3>
          <div className="grid gap-4">
            {activePlans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isOverdue={isReviewDue(plan.next_review_date)}
              />
            ))}
          </div>
        </div>
      )}

      {inactivePlans.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 text-lg text-gray-600">Inactive Plans</h3>
          <div className="grid gap-4 opacity-75">
            {inactivePlans.map(plan => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {carePlans.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No care plans yet. Create one to get started.</p>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="w-4 h-4" /> Create First Care Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}