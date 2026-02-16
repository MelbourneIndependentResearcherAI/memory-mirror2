import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sync_type, offline_conversations = [], audio_library_metadata = [], settings = {} } = body;

    const syncResults = {
      conversations_synced: 0,
      audio_library_synced: 0,
      settings_synced: false,
      errors: [],
      timestamp: new Date().toISOString()
    };

    // Sync conversations
    if (offline_conversations.length > 0) {
      for (const conversation of offline_conversations) {
        try {
          const existing = await base44.entities.Conversation.list().then(items =>
            items.find(c => c.id === conversation.id)
          );

          if (existing) {
            // Merge conversation history
            const merged_messages = [...(existing.messages || []), ...(conversation.messages || [])];
            await base44.entities.Conversation.update(conversation.id, {
              messages: merged_messages,
              detected_era: conversation.detected_era,
              anxiety_level: conversation.anxiety_level
            });
          } else {
            // Create new conversation
            await base44.entities.Conversation.create({
              ...conversation,
              mode: conversation.mode || 'chat'
            });
          }
          syncResults.conversations_synced++;
        } catch (error) {
          syncResults.errors.push(`Conversation sync failed: ${error.message}`);
        }
      }
    }

    // Sync audio library metadata (references to downloaded audio)
    if (audio_library_metadata.length > 0) {
      try {
        // Store audio library manifest in user profile or dedicated entity
        const userProfile = await base44.entities.UserProfile.list().then(profiles => profiles[0]);
        if (userProfile) {
          const updated_profile = {
            ...userProfile,
            offline_audio_library: audio_library_metadata.map(audio => ({
              id: audio.id,
              title: audio.title,
              type: audio.type,
              downloaded_at: audio.downloaded_at,
              storage_size: audio.storage_size
            }))
          };
          await base44.entities.UserProfile.update(userProfile.id, updated_profile);
          syncResults.audio_library_synced = audio_library_metadata.length;
        }
      } catch (error) {
        syncResults.errors.push(`Audio library sync failed: ${error.message}`);
      }
    }

    // Sync user settings
    if (Object.keys(settings).length > 0) {
      try {
        const userProfile = await base44.entities.UserProfile.list().then(profiles => profiles[0]);
        if (userProfile) {
          const updated_profile = {
            ...userProfile,
            offline_settings: {
              ...userProfile.offline_settings,
              ...settings,
              last_synced: new Date().toISOString()
            }
          };
          await base44.entities.UserProfile.update(userProfile.id, updated_profile);
          syncResults.settings_synced = true;
        }
      } catch (error) {
        syncResults.errors.push(`Settings sync failed: ${error.message}`);
      }
    }

    return Response.json({
      success: true,
      ...syncResults
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});