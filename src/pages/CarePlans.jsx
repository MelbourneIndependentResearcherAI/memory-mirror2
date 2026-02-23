import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CarePlanManager from '../components/caregiver/CarePlanManager';
import CarePlanBuilder from '../components/caregiver/CarePlanBuilder';
import CarePlanViewer from '../components/caregiver/CarePlanViewer';

export default function CarePlans() {
  const [view, setView] = useState('list'); // list, create, view, edit
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: patientProfiles = [] } = useQuery({
    queryKey: ['patientProfiles'],
    queryFn: async () => {
      return base44.entities.PatientProfile.filter({ caregiver_email: user?.email });
    },
    enabled: !!user?.email
  });

  const handleCreateNew = (patient) => {
    setSelectedPatient(patient);
    setView('create');
    setSelectedPlan(null);
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setView('view');
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setView('edit');
  };

  const handleSave = () => {
    setView('list');
    setSelectedPlan(null);
    setSelectedPatient(null);
  };

  const handleBack = () => {
    if (view === 'list') return;
    setView('list');
    setSelectedPlan(null);
    setSelectedPatient(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">Please log in to access care plans.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Care Plan</h1>
          <p className="text-gray-600">for {selectedPatient?.patient_name}</p>
        </div>
        <CarePlanBuilder patientProfile={selectedPatient} onSave={handleSave} />
      </div>
    );
  }

  if (view === 'view') {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <CarePlanViewer
          carePlan={selectedPlan}
          onEdit={() => setView('edit')}
        />
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Care Plan</h1>
          <p className="text-gray-600">{selectedPlan?.plan_title}</p>
        </div>
        <CarePlanBuilder patientProfile={selectedPlan} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Care Plans Management</h1>
        <p className="text-gray-600">Create and manage care plans for your patients</p>
      </div>

      {patientProfiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">No patients registered yet.</p>
            <p className="text-sm text-gray-500">Register a patient first to create care plans.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientProfiles.map(patient => (
            <Card key={patient.id}>
              <CardHeader>
                <CardTitle>{patient.patient_name}</CardTitle>
                <CardDescription>Age: {patient.age} | {patient.diagnosis}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Registered: {new Date(patient.registration_date).toLocaleDateString()}
                </p>
                <Button
                  onClick={() => setView('patient-plans')}
                  onClickCapture={() => setSelectedPatient(patient)}
                  className="w-full gap-2"
                >
                  Manage Care Plans
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === 'patient-plans' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{selectedPatient?.patient_name}'s Care Plans</CardTitle>
                <Button variant="ghost" onClick={() => setView('list')}>✕</Button>
              </div>
            </CardHeader>
            <CardContent>
              <CarePlanManager
                patientProfileId={selectedPatient?.id}
                onCreateNew={() => {
                  setView('create');
                }}
                onView={handleViewPlan}
                onEdit={handleEditPlan}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}