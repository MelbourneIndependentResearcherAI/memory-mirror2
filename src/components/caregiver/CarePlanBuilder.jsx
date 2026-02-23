import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Clock, Utensils, Heart, Phone, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CarePlanBuilder({ patientProfile, onSave }) {
  const [plan, setPlan] = useState({
    patient_profile_id: patientProfile.id,
    caregiver_email: '',
    plan_title: `Care Plan for ${patientProfile.patient_name}`,
    patient_name: patientProfile.patient_name,
    daily_routines: [],
    dietary_needs: { restrictions: [], preferences: [], meal_schedule: [], special_instructions: '' },
    medical_history: { conditions: [], medications: [], allergies: [] },
    emergency_contacts: [],
    care_instructions: [],
    status: 'active',
    review_frequency: 'monthly',
    notes: ''
  });

  const [activeRoutine, setActiveRoutine] = useState({ time: '', activity: '', notes: '' });
  const [activeMeal, setActiveMeal] = useState({ meal: '', time: '', notes: '' });
  const [activeCondition, setActiveCondition] = useState({ condition: '', diagnosed_date: '', notes: '' });
  const [activeMed, setActiveMed] = useState({ name: '', dosage: '', frequency: '', reason: '' });
  const [activeContact, setActiveContact] = useState({ name: '', relationship: '', phone: '', email: '' });
  const [activeInstruction, setActiveInstruction] = useState({ category: 'other', instruction: '', priority: 'medium' });

  const queryClient = useQueryClient();
  const saveMutation = useMutation({
    mutationFn: (planData) => base44.entities.CarePlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      onSave();
    }
  });

  const addRoutine = () => {
    if (activeRoutine.time && activeRoutine.activity) {
      setPlan(prev => ({
        ...prev,
        daily_routines: [...prev.daily_routines, activeRoutine]
      }));
      setActiveRoutine({ time: '', activity: '', notes: '' });
    }
  };

  const removeRoutine = (idx) => {
    setPlan(prev => ({
      ...prev,
      daily_routines: prev.daily_routines.filter((_, i) => i !== idx)
    }));
  };

  const addMeal = () => {
    if (activeMeal.meal && activeMeal.time) {
      setPlan(prev => ({
        ...prev,
        dietary_needs: {
          ...prev.dietary_needs,
          meal_schedule: [...prev.dietary_needs.meal_schedule, activeMeal]
        }
      }));
      setActiveMeal({ meal: '', time: '', notes: '' });
    }
  };

  const removeMeal = (idx) => {
    setPlan(prev => ({
      ...prev,
      dietary_needs: {
        ...prev.dietary_needs,
        meal_schedule: prev.dietary_needs.meal_schedule.filter((_, i) => i !== idx)
      }
    }));
  };

  const addCondition = () => {
    if (activeCondition.condition) {
      setPlan(prev => ({
        ...prev,
        medical_history: {
          ...prev.medical_history,
          conditions: [...prev.medical_history.conditions, activeCondition]
        }
      }));
      setActiveCondition({ condition: '', diagnosed_date: '', notes: '' });
    }
  };

  const removeCondition = (idx) => {
    setPlan(prev => ({
      ...prev,
      medical_history: {
        ...prev.medical_history,
        conditions: prev.medical_history.conditions.filter((_, i) => i !== idx)
      }
    }));
  };

  const addMedication = () => {
    if (activeMed.name && activeMed.dosage) {
      setPlan(prev => ({
        ...prev,
        medical_history: {
          ...prev.medical_history,
          medications: [...prev.medical_history.medications, activeMed]
        }
      }));
      setActiveMed({ name: '', dosage: '', frequency: '', reason: '' });
    }
  };

  const removeMedication = (idx) => {
    setPlan(prev => ({
      ...prev,
      medical_history: {
        ...prev.medical_history,
        medications: prev.medical_history.medications.filter((_, i) => i !== idx)
      }
    }));
  };

  const addContact = () => {
    if (activeContact.name && activeContact.phone) {
      setPlan(prev => ({
        ...prev,
        emergency_contacts: [...prev.emergency_contacts, activeContact]
      }));
      setActiveContact({ name: '', relationship: '', phone: '', email: '' });
    }
  };

  const removeContact = (idx) => {
    setPlan(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== idx)
    }));
  };

  const addInstruction = () => {
    if (activeInstruction.instruction) {
      setPlan(prev => ({
        ...prev,
        care_instructions: [...prev.care_instructions, activeInstruction]
      }));
      setActiveInstruction({ category: 'other', instruction: '', priority: 'medium' });
    }
  };

  const removeInstruction = (idx) => {
    setPlan(prev => ({
      ...prev,
      care_instructions: prev.care_instructions.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    const nextReviewDate = new Date();
    const frequencyDays = {
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30,
      'quarterly': 90
    };
    nextReviewDate.setDate(nextReviewDate.getDate() + frequencyDays[plan.review_frequency]);

    const planToSave = {
      ...plan,
      next_review_date: nextReviewDate.toISOString().split('T')[0],
      last_reviewed: new Date().toISOString()
    };

    saveMutation.mutate(planToSave);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Care Plan Details</CardTitle>
          <CardDescription>Basic information about this care plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Plan Title"
            value={plan.plan_title}
            onChange={(e) => setPlan({ ...plan, plan_title: e.target.value })}
          />
          <Textarea
            placeholder="General notes..."
            value={plan.notes}
            onChange={(e) => setPlan({ ...plan, notes: e.target.value })}
            className="h-24"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select value={plan.status} onValueChange={(v) => setPlan({ ...plan, status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={plan.review_frequency} onValueChange={(v) => setPlan({ ...plan, review_frequency: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Review Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="routines" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="dietary">Diet</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="routines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Daily Routines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input
                  type="time"
                  value={activeRoutine.time}
                  onChange={(e) => setActiveRoutine({ ...activeRoutine, time: e.target.value })}
                  placeholder="Time"
                />
                <Input
                  placeholder="Activity"
                  value={activeRoutine.activity}
                  onChange={(e) => setActiveRoutine({ ...activeRoutine, activity: e.target.value })}
                />
                <Input
                  placeholder="Notes (optional)"
                  value={activeRoutine.notes}
                  onChange={(e) => setActiveRoutine({ ...activeRoutine, notes: e.target.value })}
                />
                <Button onClick={addRoutine} className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Routine
                </Button>
              </div>
              {plan.daily_routines.map((routine, idx) => (
                <div key={idx} className="flex justify-between items-start bg-slate-100 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold">{routine.time}</p>
                    <p className="text-sm">{routine.activity}</p>
                    {routine.notes && <p className="text-xs text-slate-600">{routine.notes}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeRoutine(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dietary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Dietary Needs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Restrictions & Allergies</h4>
                <div className="flex gap-2 mb-3 flex-wrap">
                  {plan.dietary_needs.restrictions.map((r, idx) => (
                    <div key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-2">
                      {r}
                      <button onClick={() => setPlan(prev => ({
                        ...prev,
                        dietary_needs: { ...prev.dietary_needs, restrictions: prev.dietary_needs.restrictions.filter((_, i) => i !== idx) }
                      }))} className="cursor-pointer">×</button>
                    </div>
                  ))}
                </div>
                <Input placeholder="Add restriction" onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    setPlan(prev => ({
                      ...prev,
                      dietary_needs: { ...prev.dietary_needs, restrictions: [...prev.dietary_needs.restrictions, e.target.value] }
                    }));
                    e.target.value = '';
                  }
                }} />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Meal Schedule</h4>
                <div className="space-y-3 mb-3">
                  <Input placeholder="Meal (e.g., Breakfast)" value={activeMeal.meal} onChange={(e) => setActiveMeal({ ...activeMeal, meal: e.target.value })} />
                  <Input type="time" value={activeMeal.time} onChange={(e) => setActiveMeal({ ...activeMeal, time: e.target.value })} />
                  <Input placeholder="Notes" value={activeMeal.notes} onChange={(e) => setActiveMeal({ ...activeMeal, notes: e.target.value })} />
                  <Button onClick={addMeal} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add Meal
                  </Button>
                </div>
                {plan.dietary_needs.meal_schedule.map((meal, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-slate-100 p-3 rounded-lg mb-2">
                    <div>
                      <p className="font-semibold">{meal.meal} at {meal.time}</p>
                      {meal.notes && <p className="text-sm text-slate-600">{meal.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeMeal(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-2">Special Instructions</h4>
                <Textarea
                  placeholder="Nutritional guidelines, feeding instructions, etc."
                  value={plan.dietary_needs.special_instructions}
                  onChange={(e) => setPlan(prev => ({
                    ...prev,
                    dietary_needs: { ...prev.dietary_needs, special_instructions: e.target.value }
                  }))}
                  className="h-20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" /> Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Conditions</h4>
                <div className="space-y-3 mb-3">
                  <Input placeholder="Condition" value={activeCondition.condition} onChange={(e) => setActiveCondition({ ...activeCondition, condition: e.target.value })} />
                  <Input type="date" value={activeCondition.diagnosed_date} onChange={(e) => setActiveCondition({ ...activeCondition, diagnosed_date: e.target.value })} />
                  <Input placeholder="Notes" value={activeCondition.notes} onChange={(e) => setActiveCondition({ ...activeCondition, notes: e.target.value })} />
                  <Button onClick={addCondition} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add Condition
                  </Button>
                </div>
                {plan.medical_history.conditions.map((cond, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-slate-100 p-3 rounded-lg mb-2">
                    <div>
                      <p className="font-semibold">{cond.condition}</p>
                      <p className="text-xs text-slate-600">{cond.diagnosed_date}</p>
                      {cond.notes && <p className="text-sm">{cond.notes}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Current Medications</h4>
                <div className="space-y-3 mb-3">
                  <Input placeholder="Medication name" value={activeMed.name} onChange={(e) => setActiveMed({ ...activeMed, name: e.target.value })} />
                  <Input placeholder="Dosage (e.g., 500mg)" value={activeMed.dosage} onChange={(e) => setActiveMed({ ...activeMed, dosage: e.target.value })} />
                  <Input placeholder="Frequency (e.g., 3x daily)" value={activeMed.frequency} onChange={(e) => setActiveMed({ ...activeMed, frequency: e.target.value })} />
                  <Input placeholder="Reason for use" value={activeMed.reason} onChange={(e) => setActiveMed({ ...activeMed, reason: e.target.value })} />
                  <Button onClick={addMedication} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Add Medication
                  </Button>
                </div>
                {plan.medical_history.medications.map((med, idx) => (
                  <div key={idx} className="flex justify-between items-start bg-slate-100 p-3 rounded-lg mb-2">
                    <div>
                      <p className="font-semibold">{med.name} - {med.dosage}</p>
                      <p className="text-sm text-slate-600">{med.frequency}</p>
                      {med.reason && <p className="text-sm">{med.reason}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeMedication(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" /> Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Input placeholder="Name" value={activeContact.name} onChange={(e) => setActiveContact({ ...activeContact, name: e.target.value })} />
                <Input placeholder="Relationship" value={activeContact.relationship} onChange={(e) => setActiveContact({ ...activeContact, relationship: e.target.value })} />
                <Input placeholder="Phone" type="tel" value={activeContact.phone} onChange={(e) => setActiveContact({ ...activeContact, phone: e.target.value })} />
                <Input placeholder="Email" type="email" value={activeContact.email} onChange={(e) => setActiveContact({ ...activeContact, email: e.target.value })} />
                <Button onClick={addContact} className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Contact
                </Button>
              </div>
              {plan.emergency_contacts.map((contact, idx) => (
                <div key={idx} className="flex justify-between items-start bg-slate-100 p-3 rounded-lg">
                  <div>
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-slate-600">{contact.relationship}</p>
                    <p className="text-sm">{contact.phone}</p>
                    {contact.email && <p className="text-sm">{contact.email}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeContact(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Care Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Select value={activeInstruction.category} onValueChange={(v) => setActiveInstruction({ ...activeInstruction, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobility">Mobility</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="behavior">Behavior</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Instruction" value={activeInstruction.instruction} onChange={(e) => setActiveInstruction({ ...activeInstruction, instruction: e.target.value })} />
                <Select value={activeInstruction.priority} onValueChange={(v) => setActiveInstruction({ ...activeInstruction, priority: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addInstruction} className="w-full gap-2">
                  <Plus className="w-4 h-4" /> Add Instruction
                </Button>
              </div>
              {plan.care_instructions.map((instr, idx) => (
                <div key={idx} className={`p-3 rounded-lg flex justify-between items-start ${
                  instr.priority === 'critical' ? 'bg-red-100 border-l-4 border-red-600' :
                  instr.priority === 'high' ? 'bg-orange-100 border-l-4 border-orange-600' :
                  'bg-slate-100'
                }`}>
                  <div>
                    <p className="font-semibold text-sm">{instr.category}</p>
                    <p className="text-sm">{instr.instruction}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeInstruction(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? 'Saving...' : 'Save Care Plan'}
      </Button>
    </div>
  );
}