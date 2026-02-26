import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Process Payment Confirmation
 * Marks pending subscriptions as active when payment is confirmed
 * Called when admin confirms payment received or manual transfer is verified
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_reference, subscription_id } = await req.json();

    if (!payment_reference && !subscription_id) {
      return Response.json(
        { error: 'Either payment_reference or subscription_id required' },
        { status: 400 }
      );
    }

    // Find pending subscription
    let subscription;
    if (subscription_id) {
      subscription = await base44.entities.Subscription.get(subscription_id);
    } else {
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        payment_reference: payment_reference
      });
      subscription = subs[0];
    }

    if (!subscription) {
      return Response.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription to active
    const updated = await base44.asServiceRole.entities.Subscription.update(
      subscription.id,
      {
        status: 'active',
        last_payment_date: new Date().toISOString(),
        notes: `Payment confirmed on ${new Date().toISOString()}`
      }
    );

    // Log audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'payment_confirmed',
        user_email: subscription.user_email,
        details: {
          subscription_id: subscription.id,
          payment_reference: payment_reference,
          amount: subscription.plan_price
        },
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log payment confirmation:', logError);
    }

    return Response.json({
      success: true,
      subscription: updated,
      message: 'Payment confirmed and subscription activated'
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return Response.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    );
  }
});