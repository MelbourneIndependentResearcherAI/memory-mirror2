import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get Subscription Details
 * Returns detailed subscription info for a user including payment status
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all subscriptions for user, ordered by most recent
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email
    });

    if (subscriptions.length === 0) {
      return Response.json({
        hasSubscription: false,
        currentPlan: 'free',
        subscriptions: []
      });
    }

    // Sort by created_date descending to get most recent first
    subscriptions.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    // Find active subscription, fallback to pending
    const activeSubscription = subscriptions.find(sub => sub.status === 'active');
    const currentSubscription = activeSubscription || subscriptions.find(sub => sub.status === 'pending');

    return Response.json({
      hasSubscription: !!activeSubscription,
      currentPlan: currentSubscription?.plan_name || 'free',
      status: currentSubscription?.status || 'none',
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        plan_name: sub.plan_name,
        status: sub.status,
        start_date: sub.start_date,
        next_billing_date: sub.next_billing_date,
        last_payment_date: sub.last_payment_date,
        payment_reference: sub.payment_reference,
        plan_price: sub.plan_price,
        created_date: sub.created_date
      }))
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return Response.json(
      { error: 'Failed to get subscription details' },
      { status: 500 }
    );
  }
});