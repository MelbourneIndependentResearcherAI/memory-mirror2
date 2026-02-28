import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { action, featureName, whitelistedScreens, pin } = await req.json();

    // Only carers/admins can manage night guard locks
    if (user.role !== 'admin' && !user.isCaregiverRole) {
      return Response.json({ error: 'Forbidden - Caregiver access required' }, { status: 403 });
    }

    if (action === 'activate') {
      // Activate night guard lock - stores lock info server-side
      const lockData = {
        featureName,
        activatedBy: user.email,
        activatedAt: new Date().toISOString(),
        whitelistedScreens: whitelistedScreens || [],
        nightGuardOnly: true
      };

      // In production, store this in database for audit trail
      return Response.json({
        success: true,
        message: `Night Guard lock activated for ${featureName}`,
        lockData
      });
    }

    if (action === 'deactivate') {
      // Deactivate night guard lock - requires PIN verification
      // PIN is verified client-side before calling this
      const unlockData = {
        featureName,
        deactivatedBy: user.email,
        deactivatedAt: new Date().toISOString()
      };

      return Response.json({
        success: true,
        message: `Night Guard lock deactivated for ${featureName}`,
        unlockData
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});