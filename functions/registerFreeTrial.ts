import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Calculate trial dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Create free trial user record
    const trialUser = await base44.asServiceRole.entities.FreeTrialUser.create({
      name,
      email,
      trial_start_date: now.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      trial_active: true
    });

    // Store in localStorage via response for client-side use
    return Response.json({
      success: true,
      trialUser,
      trialEndDate: trialEndDate.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});