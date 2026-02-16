import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { routine_id, requires_confirmation = false } = body;

    // Fetch routine
    const routines = await base44.entities.SmartHomeRoutine.filter({ id: routine_id });
    if (!routines || routines.length === 0) {
      return Response.json({ error: 'Routine not found' }, { status: 404 });
    }

    const routine = routines[0];

    if (!routine.is_active) {
      return Response.json({ error: 'Routine is not active' }, { status: 400 });
    }

    // Check auto mode
    if (requires_confirmation && !routine.auto_mode_enabled) {
      return Response.json({
        success: false,
        requires_confirmation: true,
        routine: routine,
        message: 'This routine requires caregiver confirmation. Enable auto mode or confirm manually.'
      });
    }

    // Execute routine actions sequentially
    const results = [];
    let hasErrors = false;

    for (const deviceAction of routine.devices_and_actions) {
      // Apply delay if specified
      if (deviceAction.delay_seconds > 0) {
        await new Promise(resolve => setTimeout(resolve, deviceAction.delay_seconds * 1000));
      }

      try {
        const response = await base44.functions.invoke('controlSmartDevice', {
          device_id: deviceAction.device_id,
          action: deviceAction.action,
          parameters: deviceAction.parameters,
          routine_id: routine_id
        });

        results.push({
          device_id: deviceAction.device_id,
          action: deviceAction.action,
          success: response.data.success,
          device_name: response.data.device_name
        });
      } catch (error) {
        hasErrors = true;
        results.push({
          device_id: deviceAction.device_id,
          action: deviceAction.action,
          success: false,
          error: error.message
        });
      }
    }

    // Update routine execution stats
    await base44.entities.SmartHomeRoutine.update(routine.id, {
      execution_count: (routine.execution_count || 0) + 1,
      last_executed: new Date().toISOString()
    }).catch(() => {});

    return Response.json({
      success: !hasErrors,
      routine_name: routine.name,
      actions_executed: results.length,
      results: results
    });

  } catch (error) {
    console.error('Routine execution error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});