import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { callId, durationSeconds } = await req.json();

    if (!callId) {
      return Response.json({ error: 'Call ID is required' }, { status: 400 });
    }

    // Update call status
    const updatedCall = await base44.asServiceRole.entities.VideoCall.update(callId, {
      call_status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: durationSeconds || 0,
    });

    return Response.json({
      success: true,
      callData: updatedCall,
    });
  } catch (error) {
    console.error('End video call error:', error);
    return Response.json(
      { error: 'Failed to end video call', details: error.message },
      { status: 500 }
    );
  }
});