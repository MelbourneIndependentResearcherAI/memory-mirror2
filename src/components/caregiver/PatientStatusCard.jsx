import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Heart, Users } from 'lucide-react';

export default function PatientStatusCard({ patient, careTeamSize }) {
  if (!patient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Patient Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">Loading patient information...</p>
        </CardContent>
      </Card>
    );
  }

  const daysActive = patient.last_active
    ? Math.floor((new Date() - new Date(patient.last_active)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{patient.patient_name}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">{patient.diagnosis}</p>
          </div>
          <Badge variant="outline" className="bg-green-50">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Age</span>
            </div>
            <p className="font-semibold">{patient.age} years</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Heart className="w-4 h-4" />
              <span>Sessions</span>
            </div>
            <p className="font-semibold">{patient.session_count || 0}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>Care Team</span>
            </div>
            <p className="font-semibold">{careTeamSize} members</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>Last Active</span>
            </div>
            <p className="font-semibold text-sm">
              {patient.last_active
                ? daysActive === 0
                  ? 'Today'
                  : `${daysActive}d ago`
                : 'Never'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}