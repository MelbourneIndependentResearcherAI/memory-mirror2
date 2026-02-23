import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { patient_id, session_type = 'interaction' } = body;
    
    if (!patient_id) {
      return Response.json({ error: 'patient_id required' }, { status: 400 });
    }
    
    // Update patient's last_active and increment session count
    const patients = await base44.asServiceRole.entities.PatientProfile.filter({ id: patient_id });
    
    if (patients.length > 0) {
      const patient = patients[0];
      await base44.asServiceRole.entities.PatientProfile.update(patient_id, {
        last_active: new Date().toISOString(),
        session_count: (patient.session_count || 0) + 1
      });
      
      // Log activity
      await base44.asServiceRole.entities.ActivityLog.create({
        activity_type: session_type,
        details: {
          patient_id,
          patient_name: patient.patient_name
        }
      }).catch(() => {});
      
      return Response.json({
        success: true,
        patient_name: patient.patient_name,
        total_sessions: (patient.session_count || 0) + 1
      });
    }
    
    return Response.json({ error: 'Patient not found' }, { status: 404 });
    
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});