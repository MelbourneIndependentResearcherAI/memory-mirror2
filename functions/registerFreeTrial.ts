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

    // Check if this email already has a trial (prevent duplicate/incognito abuse)
    const existingTrials = await base44.asServiceRole.entities.FreeTrialUser.filter({ email: email.toLowerCase() });
    if (existingTrials.length > 0) {
      const existing = existingTrials[0];
      const trialEnd = new Date(existing.trial_end_date);
      const now = new Date();

      if (trialEnd > now && existing.trial_active) {
        // Active trial already exists - return it so client can use it
        return Response.json({
          success: true,
          trialUser: existing,
          trialEndDate: existing.trial_end_date,
          existing: true
        });
      } else {
        // Trial has expired - do not grant a new one
        return Response.json({
          success: false,
          error: 'Your free trial has expired. Please subscribe to continue.',
          expired: true
        }, { status: 403 });
      }
    }

    // Calculate trial dates
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    // Create free trial user record
    const trialUser = await base44.asServiceRole.entities.FreeTrialUser.create({
      name,
      email: email.toLowerCase(),
      trial_start_date: now.toISOString(),
      trial_end_date: trialEndDate.toISOString(),
      trial_active: true
    });

    return Response.json({
      success: true,
      trialUser,
      trialEndDate: trialEndDate.toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});