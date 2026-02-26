import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payment_reference, amount } = await req.json();

    if (!payment_reference || !amount) {
      return Response.json({ error: 'Missing payment details' }, { status: 400 });
    }

    // Get user's subscription
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
      payment_reference: payment_reference
    });

    if (subscriptions.length === 0) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    const subscription = subscriptions[0];

    // Validate amount matches
    if (Math.abs(subscription.plan_price - amount) > 0.01) {
      return Response.json({ 
        error: 'Amount mismatch',
        expected: subscription.plan_price,
        received: amount
      }, { status: 400 });
    }

    // Update subscription status to active
    await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      status: 'active',
      last_payment_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      subscription_id: subscription.id,
      plan: subscription.plan_name,
      message: 'Payment verified and subscription activated'
    });
  } catch (error) {
    console.error('Payment validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});