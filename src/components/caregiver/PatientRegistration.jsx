import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users, Mail, Lock, Mic, Calendar, Activity, Edit, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function PatientRegistration() {
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_email: '',
    age: '',
    diagnosis: '',
    access_pin: '',
    voice_name: ''
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: () => base44.entities.PatientProfile.list('-registration_date'),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.PatientProfile.create({
        ...data,
        caregiver_email: currentUser.email,
        registration_date: new Date().toISOString().split('T')[0],
        session_count: 0,
        is_active: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProfiles'] });
      toast.success('Patient registered successfully!');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to register patient');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PatientProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProfiles'] });
      toast.success('Patient updated successfully');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PatientProfile.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patientProfiles'] });
      toast.success('Patient removed');
    },
  });

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_email: '',
      age: '',
      diagnosis: '',
      access_pin: '',
      voice_name: ''
    });
    setEditingPatient(null);
    setShowForm(false);
  };

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, access_pin: pin });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (patient) => {
    setFormData({
      patient_name: patient.patient_name,
      patient_email: patient.patient_email,
      age: patient.age || '',
      diagnosis: patient.diagnosis || '',
      access_pin: patient.access_pin || '',
      voice_name: patient.voice_name || ''
    });
    setEditingPatient(patient);
    setShowForm(true);
  };

  const totalSessions = patients.reduce((sum, p) => sum + (p.session_count || 0), 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Patient Registration & Tracking
              </CardTitle>
              <CardDescription className="mt-2">
                Register patients to track their app usage and collect email addresses
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="min-h-[44px]">
              <UserPlus className="w-4 h-4 mr-2" />
              Register Patient
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Alert className="mb-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <Mail className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-slate-700 dark:text-slate-300">
              <strong>Email Tracking:</strong> Your caregiver email is automatically tracked. Patient email is optional—only add it if available for future contact.
            </AlertDescription>
          </Alert>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Patients</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{patients.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Today</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {patients.filter(p => {
                      if (!p.last_active) return false;
                      const lastActive = new Date(p.last_active);
                      const today = new Date();
                      return lastActive.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Sessions</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSessions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl mb-6 space-y-6 border-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingPatient ? 'Edit Patient Profile' : 'Register New Patient'}
                </h3>
                <Button type="button" variant="ghost" size="icon" onClick={resetForm}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_name">Patient Name *</Label>
                  <Input
                    id="patient_name"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                    placeholder="Full name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="patient_email">Patient Email (optional)</Label>
                  <Input
                    id="patient_email"
                    type="email"
                    value={formData.patient_email}
                    onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                    placeholder="patient@example.com (if available)"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave blank if not available</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    placeholder="e.g., 75"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="diagnosis">Diagnosis (optional)</Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g., Alzheimer's, Dementia"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                <h4 className="font-semibold text-slate-900 dark:text-white">Access Configuration</h4>
                
                <div>
                  <Label htmlFor="access_pin">4-Digit PIN (optional)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="access_pin"
                      value={formData.access_pin}
                      onChange={(e) => setFormData({ ...formData, access_pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      placeholder="1234"
                      maxLength={4}
                      className="flex-1"
                    />
                    <Button type="button" onClick={generateRandomPin} variant="outline">
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Patient can use this PIN for quick access</p>
                </div>

                <div>
                  <Label htmlFor="voice_name">Voice Name (optional)</Label>
                  <Input
                    id="voice_name"
                    value={formData.voice_name}
                    onChange={(e) => setFormData({ ...formData, voice_name: e.target.value })}
                    placeholder="e.g., John, Mary"
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Name patient will use for voice identification</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 h-12">
                  <Save className="w-4 h-4 mr-2" />
                  {editingPatient ? 'Update Patient' : 'Register Patient'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} className="h-12">
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Patients List */}
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center py-12 text-slate-500">Loading patients...</p>
            ) : patients.length === 0 && !showForm ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No patients registered yet.</p>
                <p className="text-sm">Register your first patient to start tracking.</p>
              </div>
            ) : (
              patients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {patient.patient_name}
                          </h3>
                          {!patient.is_active && (
                            <Badge variant="outline" className="text-slate-500">
                              Inactive
                            </Badge>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Mail className="w-4 h-4" />
                            <span>{patient.patient_email}</span>
                          </div>
                          {patient.access_pin && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Lock className="w-4 h-4" />
                              <span>PIN: {patient.access_pin}</span>
                            </div>
                          )}
                          {patient.voice_name && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Mic className="w-4 h-4" />
                              <span>Voice: {patient.voice_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Activity className="w-4 h-4" />
                            <span>{patient.session_count || 0} sessions</span>
                          </div>
                        </div>

                        {patient.diagnosis && (
                          <p className="text-sm text-slate-500 mt-2">
                            Diagnosis: {patient.diagnosis}
                          </p>
                        )}

                        <div className="flex gap-4 text-xs text-slate-500 mt-3">
                          <span>Registered: {new Date(patient.registration_date).toLocaleDateString()}</span>
                          {patient.last_active && (
                            <span>Last active: {new Date(patient.last_active).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(patient)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Remove ${patient.patient_name} from tracking?`)) {
                              deleteMutation.mutate(patient.id);
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

          {patients.length > 0 && (
            <Alert className="mt-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <Mail className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                <strong>Tracking Active:</strong> {patients.length} patient{patients.length !== 1 ? 's' : ''} registered. {patients.filter(p => p.patient_email).length} email{patients.filter(p => p.patient_email).length !== 1 ? 's' : ''} collected for future contact.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}