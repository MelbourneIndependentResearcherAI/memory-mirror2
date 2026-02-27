import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has premium subscription
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email,
      status: 'active'
    });

    if (subscriptions.length > 0) {
      return Response.json({
        isPremium: true,
        limits: {
          chat_messages: null,
          memory_storage: null,
          voice_enabled: true
        }
      });
    }

    // Get today's usage for free tier
    const today = new Date().toISOString().split('T')[0];
    const usage = await base44.asServiceRole.entities.DailyFreeTierUsage.filter({
      user_email: user.email,
      date: today
    });

    const currentUsage = usage[0] || {
      chat_messages_used: 0,
      chat_messages_limit: 20,
      memories_viewed: 0,
      memories_limit: 10,
      voice_minutes_used: 0,
      voice_minutes_limit: 30
    };

    return Response.json({
      isPremium: false,
      usage: {
        chat_messages: {
          used: currentUsage.chat_messages_used,
          limit: currentUsage.chat_messages_limit,
          remaining: currentUsage.chat_messages_limit - currentUsage.chat_messages_used
        },
        memories: {
          used: currentUsage.memories_viewed,
          limit: currentUsage.memories_limit,
          remaining: currentUsage.memories_limit - currentUsage.memories_viewed
        },
        voice_minutes: {
          used: currentUsage.voice_minutes_used,
          limit: currentUsage.voice_minutes_limit,
          remaining: currentUsage.voice_minutes_limit - currentUsage.voice_minutes_used
        }
      },
      isLimitExceeded: {
        chat: currentUsage.chat_messages_used >= currentUsage.chat_messages_limit,
        memories: currentUsage.memories_viewed >= currentUsage.memories_limit,
        voice: currentUsage.voice_minutes_used >= currentUsage.voice_minutes_limit
      }
    });
  } catch (error) {
    console.error('Free tier check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});