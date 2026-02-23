import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { 
      action_type, 
      user_email, 
      user_name, 
      resource_type, 
      resource_id,
      details,
      success = true
    } = await req.json();

    // Extract request metadata
    const ip_address = req.headers.get('x-forwarded-for') || 
                       req.headers.get('x-real-ip') || 
                       'unknown';
    const user_agent = req.headers.get('user-agent') || 'unknown';

    // Determine compliance flags based on action
    const compliance_flags = ['HIPAA', 'GDPR', 'PIPEDA'];
    if (action_type.includes('message') || action_type.includes('photo') || action_type.includes('voice')) {
      compliance_flags.push('PHI_ACCESS');
    }

    // Create audit log entry
    const auditLog = await base44.asServiceRole.entities.AuditLog.create({
      action_type,
      user_email,
      user_name,
      resource_type,
      resource_id,
      ip_address,
      user_agent,
      details,
      success,
      compliance_flags
    });

    return Response.json({ 
      status: 'success', 
      audit_id: auditLog.id,
      timestamp: auditLog.created_date
    });

  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't fail the main operation if audit logging fails
    return Response.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
});