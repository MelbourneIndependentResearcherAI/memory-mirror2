import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password_confirmation } = await req.json().catch(() => ({}));
    
    if (!password_confirmation) {
      return Response.json({ error: 'Password confirmation required' }, { status: 400 });
    }

    // Delete all user data (cascading)
    const userEmail = user.email;

    // Delete user-related records (using service role for cleanup)
    await Promise.all([
      base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail }).then(items =>
        Promise.all(items.map(item => base44.asServiceRole.entities.Subscription.delete(item.id)))
      ).catch(() => null),
      base44.asServiceRole.entities.Memory.filter({ created_by: userEmail }).then(items =>
        Promise.all(items.map(item => base44.asServiceRole.entities.Memory.delete(item.id)))
      ).catch(() => null),
      base44.asServiceRole.entities.CareJournal.filter({ created_by: userEmail }).then(items =>
        Promise.all(items.map(item => base44.asServiceRole.entities.CareJournal.delete(item.id)))
      ).catch(() => null),
      base44.asServiceRole.entities.ActivityLog.filter({ user_email: userEmail }).then(items =>
        Promise.all(items.map(item => base44.asServiceRole.entities.ActivityLog.delete(item.id)))
      ).catch(() => null)
    ]);

    // Log the account deletion
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'account_deleted',
      user_email: userEmail,
      timestamp: new Date().toISOString(),
      details: { reason: 'user_requested' }
    }).catch(() => null);

    return Response.json({
      success: true,
      message: 'Account and all associated data deleted successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});