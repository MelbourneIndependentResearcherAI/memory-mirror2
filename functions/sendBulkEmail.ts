import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin authentication
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    let { subject, body, recipientEmails } = await req.json();

    // If no recipients provided, fetch all users and patients
    if (!recipientEmails || recipientEmails.length === 0) {
      const users = await base44.asServiceRole.entities.User.list();
      const patients = await base44.asServiceRole.entities.PatientProfile.list();
      recipientEmails = [
        ...users.map(u => u.email),
        ...patients.filter(p => p.patient_email).map(p => p.patient_email)
      ];
    } else {
      // Filter out null/undefined emails
      recipientEmails = recipientEmails.filter(email => email && email.trim());
    }

    if (!subject || !body || !recipientEmails || recipientEmails.length === 0) {
      return Response.json(
        { error: 'Missing required fields: subject, body, recipientEmails' },
        { status: 400 }
      );
    }

    // Send emails to all recipients
    const emailPromises = recipientEmails.map(async (email) => {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: body,
          from_name: 'Memory Mirror Admin'
        });
        return { email, success: true };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, success: false, error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return Response.json({
      success: true,
      message: `Sent ${successCount} emails successfully, ${failureCount} failed`,
      totalRecipients: recipientEmails.length,
      successCount,
      failureCount,
      details: results
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    return Response.json(
      { error: error.message || 'Failed to send bulk emails' },
      { status: 500 }
    );
  }
});