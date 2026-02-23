import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, sender_name, message_preview, recipient_emails } = await req.json();

    // HIPAA/GDPR Compliance: Don't include full message content in notification
    // Only send minimal info needed for notification
    
    const notificationTitle = `💬 New message from ${sender_name}`;
    const notificationBody = message_preview 
      ? message_preview.substring(0, 50) + (message_preview.length > 50 ? '...' : '')
      : 'You have a new message';

    // Send notification to family members
    // In production, this would integrate with push notification service (FCM, APNS, etc.)
    const notifications = [];
    
    for (const email of recipient_emails || []) {
      // Create in-app notification
      await base44.asServiceRole.entities.CaregiverAlert.create({
        alert_type: 'family_chat',
        severity: 'low',
        title: notificationTitle,
        message: notificationBody,
        is_read: false,
        recipient_email: email,
        message_id: message_id
      });
      
      notifications.push({ email, status: 'sent' });
    }

    // Mark message as notification sent
    await base44.asServiceRole.entities.FamilyChat.update(message_id, {
      notification_sent: true
    });

    return Response.json({
      status: 'success',
      notifications_sent: notifications.length,
      recipients: notifications
    });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});