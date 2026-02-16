import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { device_id, action, parameters = {}, routine_id = null } = body;

    // Fetch device configuration
    const devices = await base44.entities.SmartDevice.filter({ device_id });
    if (!devices || devices.length === 0) {
      return Response.json({ error: 'Device not found' }, { status: 404 });
    }

    const device = devices[0];
    
    if (!device.is_active) {
      return Response.json({ error: 'Device is not active' }, { status: 400 });
    }

    // Get API key from environment
    const apiKey = Deno.env.get(device.api_key_reference);
    if (!apiKey) {
      return Response.json({ error: 'Device API key not configured' }, { status: 500 });
    }

    // Prepare device command based on type
    const payload = buildDevicePayload(device.device_type, action, parameters);

    // Send control command to device API
    const response = await fetch(device.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        device_id: device.device_id,
        action,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`Device API error: ${response.statusText}`);
    }

    const deviceResponse = await response.json();

    // Update device state in database
    const updatedState = {
      ...device.current_state,
      ...extractStateFromResponse(device.device_type, action, deviceResponse)
    };

    await base44.entities.SmartDevice.update(device.id, {
      current_state: updatedState
    });

    // Log routine execution if applicable
    if (routine_id) {
      const routines = await base44.entities.SmartHomeRoutine.filter({ id: routine_id });
      if (routines.length > 0) {
        const routine = routines[0];
        await base44.entities.SmartHomeRoutine.update(routine.id, {
          execution_count: (routine.execution_count || 0) + 1,
          last_executed: new Date().toISOString()
        }).catch(() => {});
      }
    }

    return Response.json({
      success: true,
      device_name: device.name,
      action,
      new_state: updatedState,
      device_response: deviceResponse
    });

  } catch (error) {
    console.error('Device control error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildDevicePayload(deviceType, action, parameters) {
  const payloads = {
    light: {
      on: { power: true },
      off: { power: false },
      brightness: { brightness: parameters.brightness },
      color: { color: parameters.color },
      dim_comfort: { brightness: 40, color: '#FF9500' },
      bright_alert: { brightness: 100, color: '#FF0000' }
    },
    thermostat: {
      set_temperature: { target_temperature: parameters.temperature },
      set_mode: { mode: parameters.mode },
      comfort_cool: { target_temperature: 72, mode: 'cool' },
      comfort_warm: { target_temperature: 70, mode: 'heat' }
    },
    door_lock: {
      lock: { locked: true },
      unlock: { locked: false }
    },
    camera: {
      enable: { recording: true },
      disable: { recording: false },
      snapshot: { action: 'snapshot' }
    },
    plug: {
      on: { power: true },
      off: { power: false }
    }
  };

  return payloads[deviceType]?.[action] || {};
}

function extractStateFromResponse(deviceType, action, response) {
  const stateExtractors = {
    light: (resp) => ({
      power: resp.power,
      brightness: resp.brightness,
      color: resp.color
    }),
    thermostat: (resp) => ({
      temperature: resp.current_temperature,
      target_temperature: resp.target_temperature,
      mode: resp.mode
    }),
    door_lock: (resp) => ({
      locked: resp.locked
    }),
    camera: (resp) => ({
      recording: resp.recording,
      status: resp.status
    }),
    plug: (resp) => ({
      power: resp.power
    })
  };

  return stateExtractors[deviceType]?.(response) || {};
}