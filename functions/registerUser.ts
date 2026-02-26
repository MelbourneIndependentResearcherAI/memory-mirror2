import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { full_name } = await req.json();

    if (!full_name || !full_name.trim()) {
      return Response.json({ error: 'Full name is required' }, { status: 400 });
    }

    // Update user profile with full name
    const updatedUser = await base44.auth.updateMe({
      full_name: full_name.trim(),
    });

    // Log registration in audit
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'user_registration',
      user_email: user.email,
      user_name: full_name.trim(),
      details: {
        timestamp: new Date().toISOString(),
        registration_type: 'subscription',
      },
    });

    return Response.json({
      success: true,
      message: 'Registration completed successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
});