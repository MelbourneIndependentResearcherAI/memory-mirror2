import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process Monthly Subscription Renewal
 * Automatically renews active subscriptions by updating next billing date
 * Triggered monthly via automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active premium subscriptions
    const activeSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'active',
      plan_name: 'premium'
    });

    const today = new Date();
    let renewed = 0;
    let failed = 0;

    // Check each subscription to see if renewal is due
    for (const subscription of activeSubscriptions) {
      try {
        const nextBillingDate = new Date(subscription.next_billing_date);

        // If next billing date is today or past, renew
        if (nextBillingDate <= today) {
          const newBillingDate = new Date(today);
          newBillingDate.setMonth(newBillingDate.getMonth() + 1);

          // Update subscription with new billing date
          await base44.asServiceRole.entities.Subscription.update(subscription.id, {
            next_billing_date: newBillingDate.toISOString(),
            last_payment_date: today.toISOString(),
            notes: `Auto-renewed on ${today.toISOString()}`
          });

          // Log the renewal
          try {
            await base44.asServiceRole.entities.AuditLog.create({
              action: 'subscription_auto_renewed',
              user_email: subscription.user_email,
              details: {
                subscription_id: subscription.id,
                plan: subscription.plan_name,
                amount: subscription.plan_price,
                previous_billing_date: subscription.next_billing_date,
                new_billing_date: newBillingDate.toISOString()
              },
              timestamp: today.toISOString()
            });
          } catch (logError) {
            console.error('Failed to log renewal:', logError);
          }

          renewed++;
        }
      } catch (error) {
        console.error(`Failed to renew subscription ${subscription.id}:`, error);
        failed++;

        // Log failure
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            action: 'subscription_renewal_failed',
            user_email: subscription.user_email,
            details: {
              subscription_id: subscription.id,
              error: error.message,
              timestamp: today.toISOString()
            }
          });
        } catch (logError) {
          console.error('Failed to log renewal error:', logError);
        }
      }
    }

    return Response.json({
      success: true,
      processed: activeSubscriptions.length,
      renewed,
      failed,
      timestamp: today.toISOString()
    });
  } catch (error) {
    console.error('Monthly renewal process error:', error);
    return Response.json(
      { error: 'Failed to process monthly renewals' },
      { status: 500 }
    );
  }
});