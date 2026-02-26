import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Validate Payment Reference
 * Checks if a payment reference exists and returns subscription details
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payment_reference, email } = await req.json();

    if (!payment_reference || !email) {
      return Response.json(
        { error: 'payment_reference and email are required' },
        { status: 400 }
      );
    }

    // Search for subscription with this payment reference
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      payment_reference: payment_reference,
      user_email: email
    });

    if (subscriptions.length === 0) {
      return Response.json({
        valid: false,
        message: 'Payment reference not found'
      });
    }

    const subscription = subscriptions[0];

    return Response.json({
      valid: true,
      subscription: {
        id: subscription.id,
        user_email: subscription.user_email,
        plan_name: subscription.plan_name,
        plan_price: subscription.plan_price,
        status: subscription.status,
        start_date: subscription.start_date,
        next_billing_date: subscription.next_billing_date
      },
      message: subscription.status === 'active' 
        ? 'Payment confirmed and subscription active' 
        : 'Payment reference found - pending confirmation'
    });
  } catch (error) {
    console.error('Validate payment reference error:', error);
    return Response.json(
      { error: 'Failed to validate payment reference' },
      { status: 500 }
    );
  }
});