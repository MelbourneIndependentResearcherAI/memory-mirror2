import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Check Subscription Expiry
 * Marks subscriptions as expired if they're overdue
 * Triggered daily via automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all pending subscriptions (not yet paid)
    const pendingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'pending'
    });

    const today = new Date();
    let expired = 0;

    // Check each pending subscription - expire if 30+ days old with no payment
    for (const subscription of pendingSubscriptions) {
      try {
        const createdDate = new Date(subscription.created_date);
        const daysOld = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

        // Expire if pending for more than 30 days
        if (daysOld >= 30) {
          await base44.asServiceRole.entities.Subscription.update(subscription.id, {
            status: 'expired',
            notes: `Expired due to no payment received within 30 days (${daysOld} days)`
          });

          // Log expiry
          try {
            await base44.asServiceRole.entities.AuditLog.create({
              action: 'subscription_expired',
              user_email: subscription.user_email,
              details: {
                subscription_id: subscription.id,
                reason: 'Payment not received within 30 days',
                days_pending: daysOld
              },
              timestamp: today.toISOString()
            });
          } catch (logError) {
            console.error('Failed to log expiry:', logError);
          }

          expired++;
        }
      } catch (error) {
        console.error(`Failed to expire subscription ${subscription.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      checked: pendingSubscriptions.length,
      expired,
      timestamp: today.toISOString()
    });
  } catch (error) {
    console.error('Subscription expiry check error:', error);
    return Response.json(
      { error: 'Failed to check subscription expiry' },
      { status: 500 }
    );
  }
});