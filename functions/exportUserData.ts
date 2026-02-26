import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all user-related data
    const [subscriptions, memories, conversations, careJournals, feedbacks] = await Promise.all([
      base44.entities.Subscription.filter({ user_email: user.email }).catch(() => []),
      base44.entities.Memory.filter({ created_by: user.email }).catch(() => []),
      base44.entities.Conversation.filter({ created_by: user.email }).catch(() => []),
      base44.entities.CareJournal.filter({ created_by: user.email }).catch(() => []),
      base44.entities.Feedback.filter({ created_by: user.email }).catch(() => [])
    ]);

    const exportData = {
      export_date: new Date().toISOString(),
      user_info: {
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_date
      },
      data: {
        subscriptions,
        memories: memories.length,
        conversations: conversations.length,
        care_journals: careJournals.length,
        feedbacks: feedbacks.length
      },
      summary: {
        total_records: subscriptions.length + memories.length + conversations.length + careJournals.length + feedbacks.length,
        accounts_count: 1
      }
    };

    // Return as JSON file download
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="memory-mirror-data-${Date.now()}.json"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});