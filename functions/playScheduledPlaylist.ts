import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const activeSchedules = await base44.asServiceRole.entities.PlaylistSchedule.filter({ is_active: true });
    const triggeredSchedules = [];
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = now.getDay();
    
    for (const schedule of activeSchedules) {
      let shouldTrigger = false;
      
      // Check if time matches
      if (schedule.schedule_time === currentTime) {
        // Check if day matches (empty array = every day)
        if (!schedule.days_of_week || schedule.days_of_week.length === 0) {
          shouldTrigger = true;
        } else if (schedule.days_of_week.includes(currentDay)) {
          shouldTrigger = true;
        }
      }
      
      if (shouldTrigger) {
        // Update last_triggered
        await base44.asServiceRole.entities.PlaylistSchedule.update(schedule.id, {
          last_triggered: new Date().toISOString()
        }).catch(() => {});
        
        // Log the trigger
        await base44.asServiceRole.entities.ActivityLog.create({
          activity_type: 'playlist_scheduled',
          details: {
            playlist_id: schedule.playlist_id,
            playlist_name: schedule.playlist_name,
            auto_play: schedule.auto_play
          }
        }).catch(() => {});
        
        triggeredSchedules.push({
          playlist_name: schedule.playlist_name,
          time: schedule.schedule_time,
          auto_play: schedule.auto_play
        });
      }
    }
    
    return Response.json({
      success: true,
      triggered_count: triggeredSchedules.length,
      schedules: triggeredSchedules
    });
    
  } catch (error) {
    console.error('Playlist schedule error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});