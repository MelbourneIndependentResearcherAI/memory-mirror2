import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { feature_type, amount = 1 } = await req.json();

    if (!feature_type) {
      return Response.json({ error: 'Missing feature_type' }, { status: 400 });
    }

    // Check if premium first
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
      status: 'active'
    });

    if (subscriptions.length > 0) {
      return Response.json({ isPremium: true, usage_incremented: false });
    }

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    let usage = (await base44.asServiceRole.entities.DailyFreeTierUsage.filter({
      user_email: user.email,
      date: today
    }))[0];

    // Create if doesn't exist
    if (!usage) {
      usage = await base44.asServiceRole.entities.DailyFreeTierUsage.create({
        user_email: user.email,
        date: today,
        chat_messages_used: 0,
        chat_messages_limit: 50,
        memories_viewed: 0,
        memories_limit: 30,
        voice_minutes_used: 0,
        voice_minutes_limit: 60
      });
    }

    // Increment based on feature type
    const updateData = {};
    let fieldName = '';
    let limitField = '';

    if (feature_type === 'chat') {
      updateData.chat_messages_used = (usage.chat_messages_used || 0) + amount;
      fieldName = 'chat_messages_used';
      limitField = 'chat_messages_limit';
    } else if (feature_type === 'memory') {
      updateData.memories_viewed = (usage.memories_viewed || 0) + amount;
      fieldName = 'memories_viewed';
      limitField = 'memories_limit';
    } else if (feature_type === 'voice') {
      updateData.voice_minutes_used = (usage.voice_minutes_used || 0) + amount;
      fieldName = 'voice_minutes_used';
      limitField = 'voice_minutes_limit';
    }

    // Check if limit exceeded
    const newUsage = updateData[fieldName];
    const limit = usage[limitField];
    const isLimitExceeded = newUsage >= limit;

    if (isLimitExceeded) {
      updateData.is_limit_exceeded = true;
    }

    await base44.asServiceRole.entities.DailyFreeTierUsage.update(usage.id, updateData);

    return Response.json({
      success: true,
      isPremium: false,
      feature: feature_type,
      used: newUsage,
      limit: limit,
      isLimitExceeded: isLimitExceeded,
      message: isLimitExceeded ? 'Daily limit reached for this feature' : 'Usage updated'
    });
  } catch (error) {
    console.error('Increment usage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});