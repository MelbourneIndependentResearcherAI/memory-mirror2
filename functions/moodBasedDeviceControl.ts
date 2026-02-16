import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { anxiety_level, detected_mood, conversation_context } = await req.json();

    // Find applicable mood-based automations
    const automations = await base44.entities.MoodBasedAutomation.list();
    
    // Filter automations that match the detected mood and anxiety level
    const applicableAutomations = automations.filter(auto => {
      const moodMatches = auto.mood_label === detected_mood;
      const anxietyMatches = anxiety_level >= (auto.anxiety_threshold || 0);
      return moodMatches && anxietyMatches && auto.is_enabled;
    });

    if (applicableAutomations.length === 0) {
      return Response.json({ applied: false, message: 'No matching automations' });
    }

    const appliedChanges = [];

    for (const automation of applicableAutomations) {
      // Get the smart devices
      const devices = await base44.asServiceRole.entities.SmartDevice.list();
      
      for (const action of automation.device_actions) {
        const device = devices.find(d => d.id === action.device_id);
        if (!device) continue;

        try {
          // Execute device control via the API
          const controlPayload = {
            device_id: device.id,
            action: action.action,
            parameters: action.parameters || {}
          };

          const response = await base44.functions.invoke('controlSmartDevice', controlPayload);
          
          appliedChanges.push({
            device_id: device.id,
            device_name: device.name,
            action: action.action,
            success: response.data?.success || false
          });
        } catch (error) {
          console.error(`Failed to control device ${device.name}:`, error.message);
        }
      }

      // Play music if specified
      if (automation.music_playlist_id) {
        try {
          const playlist = await base44.entities.Playlist.list();
          const matchingPlaylist = playlist.find(p => p.id === automation.music_playlist_id);
          if (matchingPlaylist) {
            appliedChanges.push({
              type: 'music',
              playlist_name: matchingPlaylist.name,
              success: true
            });
          }
        } catch (error) {
          console.error('Failed to apply music:', error.message);
        }
      }
    }

    return Response.json({
      applied: appliedChanges.length > 0,
      automations_triggered: applicableAutomations.map(a => a.name),
      changes_applied: appliedChanges,
      suggestion_message: `I've adjusted your environment to help with ${detected_mood} feelings. Your lights are dimmed and soothing music is ready to play.`
    });

  } catch (error) {
    console.error('Mood-based control error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});