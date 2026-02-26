import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email
    });

    const activeSubscription = subscriptions.find(sub => sub.status === 'active');
    
    if (!activeSubscription) {
      // User is on free tier
      return Response.json({
        plan: 'free',
        status: 'active',
        features: {
          conversation_limit: 10, // per day
          memory_storage_limit: 5, // memories
          voice_enabled: true,
          offline_mode: false,
          family_sharing: false,
          priority_support: false,
          advanced_analytics: false
        }
      });
    }

    // User has premium subscription
    return Response.json({
      plan: activeSubscription.plan_name,
      status: activeSubscription.status,
      subscription_id: activeSubscription.id,
      start_date: activeSubscription.start_date,
      next_billing_date: activeSubscription.next_billing_date,
      price: activeSubscription.plan_price,
      features: {
        conversation_limit: null, // unlimited
        memory_storage_limit: null, // unlimited
        voice_enabled: true,
        offline_mode: true,
        family_sharing: true,
        priority_support: true,
        advanced_analytics: true,
        voice_cloning: true,
        smart_home_integration: true,
        night_watch: true
      }
    });
  } catch (error) {
    console.error('Subscription check error:', error);
    return Response.json({ 
      error: 'Failed to check subscription',
      plan: 'free' 
    }, { status: 500 });
  }
});