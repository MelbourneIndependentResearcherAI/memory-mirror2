import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Audit Logging for HIPAA, GDPR, PDPA Compliance
 * Logs all access to health/personal data for regulatory compliance
 * Required for: HIPAA (US), GDPR (EU), PDPA (Australia), PIPEDA (Canada)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      action_type, // 'read', 'write', 'delete', 'export', 'share'
      resource_type, // 'memory', 'health_data', 'contact_info'
      resource_id,
      details = {},
    } = body;

    // Create audit log entry
    const auditEntry = {
      action_type,
      user_email: user.email,
      user_name: user.full_name,
      resource_type,
      resource_id,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent'),
      details,
      success: true,
      compliance_flags: getComplianceFlags(resource_type),
    };

    // Log to database
    await base44.asServiceRole.entities.AuditLog.create(auditEntry);

    // For sensitive operations, also log to enhanced audit trail
    if (['delete', 'export', 'share'].includes(action_type)) {
      console.log(`[AUDIT] ${action_type.toUpperCase()}: ${user.email} accessed ${resource_type}/${resource_id}`);
    }

    return Response.json({
      success: true,
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    console.error('Audit logging error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getComplianceFlags(resourceType) {
  const flagMap = {
    health_data: ['HIPAA', 'GDPR', 'PDPA', 'PIPEDA'],
    personal_data: ['GDPR', 'PDPA', 'PIPEDA', 'CCPA'],
    contact_info: ['GDPR', 'PDPA', 'PIPEDA'],
    biometric_data: ['GDPR', 'PIPEDA'],
    genetic_data: ['GDPR'],
  };
  return flagMap[resourceType] || ['GENERAL'];
}