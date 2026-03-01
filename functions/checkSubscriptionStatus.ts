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
    const activePremium = activeSubscription?.plan_name === 'premium' ? activeSubscription : null;

    // Collect all active tool subscriptions
    const activeToolSubscriptions = subscriptions.filter(
      sub => sub.plan_name === 'tool_subscription' && sub.status === 'active'
    );
    const subscribedTools: string[] = activeToolSubscriptions.flatMap(
      (sub: Record<string, unknown>) => (sub.subscribed_tools as string[]) || []
    );

    if (!activePremium && activeToolSubscriptions.length === 0) {
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

    if (activePremium) {
      // User has premium subscription
      return Response.json({
        plan: activePremium.plan_name,
        status: activePremium.status,
        subscription_id: activePremium.id,
        start_date: activePremium.start_date,
        next_billing_date: activePremium.next_billing_date,
        price: activePremium.plan_price,
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
    }

    // User has individual tool subscriptions only
    return Response.json({
      plan: 'tool_subscription',
      status: 'active',
      subscribed_tools: subscribedTools,
      features: {
        conversation_limit: subscribedTools.includes('ai_chat') ? null : 10,
        memory_storage_limit: 5,
        voice_enabled: true,
        offline_mode: false,
        family_sharing: false,
        priority_support: false,
        advanced_analytics: false,
        night_watch: subscribedTools.includes('night_watch'),
        music_therapy: subscribedTools.includes('music'),
        fake_banking: subscribedTools.includes('banking'),
        gps_safety: subscribedTools.includes('gps_safety'),
        caregiver_tools: subscribedTools.includes('caregiver_tools')
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