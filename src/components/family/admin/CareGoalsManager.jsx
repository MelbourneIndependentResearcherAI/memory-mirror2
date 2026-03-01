import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const categoryColors = {
  health: 'bg-red-100 text-red-700',
  social: 'bg-blue-100 text-blue-700',
  cognitive: 'bg-purple-100 text-purple-700',
  physical: 'bg-green-100 text-green-700',
  emotional: 'bg-pink-100 text-pink-700',
  daily_routine: 'bg-amber-100 text-amber-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  paused: 'bg-yellow-100 text-yellow-700',
};

export default function CareGoalsManager({ isAdmin, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'health', due_date: '', notes: '' });

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['careGoals'],
    queryFn: () => base44.entities.CareGoal.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CareGoal.create({ ...data, created_by: currentUserEmail, status: 'active', progress: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careGoals'] });
      toast.success('Care goal created!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'health', due_date: '', notes: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.CareGoal.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['careGoals'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CareGoal.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careGoals'] });
      toast.success('Goal removed');
    }
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Shared Care Goals</CardTitle>
          {isAdmin && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700 gap-2">
              <Plus className="w-4 h-4" /> Add Goal
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm && isAdmin && (
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 mb-6 space-y-3">
              <Input placeholder="Goal title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="h-20" />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['health','social','cognitive','physical','emotional','daily_routine'].map(c => (
                      <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <Textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="h-16" />
              <div className="flex gap-2">
                <Button onClick={() => createMutation.mutate(form)} disabled={!form.title} className="bg-purple-600 hover:bg-purple-700">Create Goal</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {isLoading && <p className="text-center text-slate-500 py-8">Loading goals...</p>}
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{goal.title}</span>
                      <Badge className={categoryColors[goal.category]}>{goal.category?.replace('_', ' ')}</Badge>
                      <Badge className={statusColors[goal.status]}>{goal.status}</Badge>
                    </div>
                    {goal.description && <p className="text-sm text-slate-600 dark:text-slate-400">{goal.description}</p>}
                    {goal.due_date && <p className="text-xs text-slate-500 mt-1">Due: {goal.due_date}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2 flex-shrink-0">
                      {goal.status !== 'completed' && (
                        <Button variant="ghost" size="icon" onClick={() => updateMutation.mutate({ id: goal.id, data: { status: 'completed', progress: 100 } })} className="text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(goal.id)} className="text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${goal.progress || 0}%` }} />
                  </div>
                  {isAdmin && goal.status !== 'completed' && (
                    <input
                      type="range" min="0" max="100" value={goal.progress || 0}
                      onChange={e => updateMutation.mutate({ id: goal.id, data: { progress: parseInt(e.target.value) } })}
                      className="w-full mt-2 accent-purple-600"
                    />
                  )}
                </div>
              </div>
            ))}
            {goals.length === 0 && !isLoading && (
              <p className="text-slate-500 text-center py-8">No care goals yet.{isAdmin ? ' Create one above!' : ''}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}