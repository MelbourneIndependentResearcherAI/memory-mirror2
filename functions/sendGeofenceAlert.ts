import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { zone_name, latitude, longitude, distance_from_zone, alert_emails } = await req.json();

    if (!zone_name || !latitude || !longitude || !alert_emails) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    
    // Create notifications in the system instead of sending emails
    const emailPromises = alert_emails.map(async email => {
      // Send notification to caregiver notification center
      await base44.asServiceRole.entities.CaregiverNotification.create({
        notification_type: 'safety_concern',
        severity: 'urgent',
        title: `Patient Left Safe Zone - ${zone_name}`,
        message: `Patient has left the ${zone_name} safe zone. Distance: ${distance_from_zone}m. View location immediately.`,
        data: {
          latitude,
          longitude,
          zone_name,
          distance_from_zone,
          google_maps_url: googleMapsUrl
        },
        triggered_by: 'geofence_system'
      });

      // Also send email notification
      return base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `🚨 URGENT: Patient Left Safe Zone - ${zone_name}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0;">⚠️ Geofence Alert</h1>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb;">
              <h2 style="color: #dc2626; margin-top: 0;">Patient Has Left Safe Zone</h2>
              
              <p><strong>Safe Zone:</strong> ${zone_name}</p>
              <p><strong>Distance from zone:</strong> ${distance_from_zone} meters</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              
              <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-left: 4px solid #dc2626;">
                <h3 style="margin-top: 0;">Current Location:</h3>
                <p>Latitude: ${latitude}</p>
                <p>Longitude: ${longitude}</p>
              </div>
              
              <a href="${googleMapsUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">
                📍 View Location on Google Maps
              </a>
              
              <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px;">
                <p style="margin: 0;"><strong>⚠️ Immediate Action Required:</strong></p>
                <ul style="margin: 10px 0;">
                  <li>Check the patient's location immediately</li>
                  <li>Call the patient's phone</li>
                  <li>If no response, consider contacting emergency services</li>
                  <li>Track the live location from the app's caregiver portal</li>
                </ul>
              </div>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                Memory Mirror Night Watch - Geofence Alert System
              </p>
            </div>
          </div>
        `
      })
    );

    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      alerts_sent: alert_emails.length,
      location_url: googleMapsUrl
    });

  } catch (error) {
    console.error('Geofence alert error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});