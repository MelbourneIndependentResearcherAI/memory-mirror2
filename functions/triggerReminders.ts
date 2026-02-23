import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const activeReminders = await base44.asServiceRole.entities.Reminder.filter({ is_active: true });
    const triggeredReminders = [];
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay();
    
    for (const reminder of activeReminders) {
      let shouldTrigger = false;
      
      if (reminder.schedule_type === 'daily' && reminder.time_of_day === currentTime) {
        shouldTrigger = true;
      } else if (reminder.schedule_type === 'weekly' && 
                 reminder.days_of_week?.includes(currentDay) && 
                 reminder.time_of_day === currentTime) {
        shouldTrigger = true;
      } else if (reminder.schedule_type === 'interval') {
        const lastAck = reminder.last_acknowledged ? new Date(reminder.last_acknowledged) : new Date(0);
        const hoursSince = (now - lastAck) / (1000 * 60 * 60);
        if (hoursSince >= (reminder.interval_hours || 4)) {
          shouldTrigger = true;
        }
      }
      
      if (shouldTrigger) {
        triggeredReminders.push({
          id: reminder.id,
          title: reminder.title,
          type: reminder.reminder_type,
          voice_prompt: reminder.voice_prompt || reminder.title
        });
        
        // Log to activity
        await base44.asServiceRole.entities.ActivityLog.create({
          activity_type: 'reminder_triggered',
          details: {
            reminder_id: reminder.id,
            reminder_title: reminder.title,
            reminder_type: reminder.reminder_type
          }
        }).catch(() => {});
      }
    }
    
    return Response.json({
      success: true,
      triggered_count: triggeredReminders.length,
      reminders: triggeredReminders
    });
    
  } catch (error) {
    console.error('Reminder trigger error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});