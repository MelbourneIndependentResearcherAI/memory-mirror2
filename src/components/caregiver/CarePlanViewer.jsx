import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Utensils, Heart, Phone, AlertCircle, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function CarePlanViewer({ carePlan, onEdit }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{carePlan.plan_title}</CardTitle>
              <CardDescription>{carePlan.patient_name}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(carePlan.status)}>
                {carePlan.status}
              </Badge>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                <Edit className="w-4 h-4" /> Edit
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {carePlan.notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm">{carePlan.notes}</p>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600">Review Frequency</p>
              <p className="font-semibold capitalize">{carePlan.review_frequency}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Next Review</p>
              <p className="font-semibold flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {carePlan.next_review_date ? format(new Date(carePlan.next_review_date), 'MMM dd') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Last Reviewed</p>
              <p className="font-semibold">{carePlan.last_reviewed ? format(new Date(carePlan.last_reviewed), 'MMM dd, yyyy') : 'Never'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Created</p>
              <p className="font-semibold">{format(new Date(carePlan.created_date), 'MMM dd, yyyy')}</p>
            </div>
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

        <TabsContent value="routines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" /> Daily Routines
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carePlan.daily_routines && carePlan.daily_routines.length > 0 ? (
                <div className="space-y-3">
                  {carePlan.daily_routines.map((routine, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-lg">{routine.time}</p>
                          <p className="text-gray-700">{routine.activity}</p>
                          {routine.notes && <p className="text-sm text-gray-600 mt-1">{routine.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No daily routines added</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dietary">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Dietary Needs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {carePlan.dietary_needs?.restrictions && carePlan.dietary_needs.restrictions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Restrictions & Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {carePlan.dietary_needs.restrictions.map((r, idx) => (
                      <Badge key={idx} variant="destructive">{r}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {carePlan.dietary_needs?.meal_schedule && carePlan.dietary_needs.meal_schedule.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Meal Schedule</h4>
                  <div className="space-y-2">
                    {carePlan.dietary_needs.meal_schedule.map((meal, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                        <div>
                          <p className="font-semibold">{meal.meal}</p>
                          {meal.notes && <p className="text-sm text-gray-600">{meal.notes}</p>}
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{meal.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {carePlan.dietary_needs?.special_instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Special Instructions</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{carePlan.dietary_needs.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" /> Medical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {carePlan.medical_history?.conditions && carePlan.medical_history.conditions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Conditions</h4>
                  <div className="space-y-2">
                    {carePlan.medical_history.conditions.map((cond, idx) => (
                      <div key={idx} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                        <p className="font-semibold">{cond.condition}</p>
                        {cond.diagnosed_date && <p className="text-sm text-gray-600">Diagnosed: {cond.diagnosed_date}</p>}
                        {cond.notes && <p className="text-sm text-gray-700 mt-1">{cond.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {carePlan.medical_history?.medications && carePlan.medical_history.medications.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Current Medications</h4>
                  <div className="space-y-2">
                    {carePlan.medical_history.medications.map((med, idx) => (
                      <div key={idx} className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded">
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        {med.reason && <p className="text-sm text-gray-700 mt-1">Reason: {med.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {carePlan.medical_history?.allergies && carePlan.medical_history.allergies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Allergies</h4>
                  <div className="flex flex-wrap gap-2">
                    {carePlan.medical_history.allergies.map((allergy, idx) => (
                      <Badge key={idx} variant="destructive">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" /> Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carePlan.emergency_contacts && carePlan.emergency_contacts.length > 0 ? (
                <div className="space-y-3">
                  {carePlan.emergency_contacts.map((contact, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-lg p-4">
                      <p className="font-semibold text-lg">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.relationship}</p>
                      <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline text-sm">{contact.phone}</a>
                      {contact.email && <p className="text-sm text-gray-600">{contact.email}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No emergency contacts added</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Care Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carePlan.care_instructions && carePlan.care_instructions.length > 0 ? (
                <div className="space-y-3">
                  {carePlan.care_instructions.map((instr, idx) => {
                    const bgColor = instr.priority === 'critical' ? 'border-l-red-600 bg-red-50' :
                                   instr.priority === 'high' ? 'border-l-orange-600 bg-orange-50' :
                                   instr.priority === 'medium' ? 'border-l-yellow-600 bg-yellow-50' :
                                   'border-l-blue-600 bg-blue-50';
                    return (
                      <div key={idx} className={`border-l-4 ${bgColor} p-4 rounded`}>
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <Badge className={getPriorityColor(instr.priority)} className="mb-2">
                              {instr.priority.toUpperCase()}
                            </Badge>
                            <p className="font-semibold capitalize text-sm text-gray-600">{instr.category}</p>
                            <p className="text-gray-700 mt-1">{instr.instruction}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No care instructions added</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}