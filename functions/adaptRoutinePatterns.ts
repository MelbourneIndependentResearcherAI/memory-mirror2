import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patient_profile_id, current_routine_id } = await req.json();

    if (!patient_profile_id || !current_routine_id) {
      return Response.json({ 
        error: 'Missing patient_profile_id or current_routine_id' 
      }, { status: 400 });
    }

    // Get current routine
    const currentRoutine = await base44.entities.DailyRoutinePattern.filter({
      id: current_routine_id,
      patient_profile_id: patient_profile_id
    });

    if (!currentRoutine || currentRoutine.length === 0) {
      return Response.json({ 
        error: 'Routine not found' 
      }, { status: 404 });
    }

    const routine = currentRoutine[0];

    // Get recent activity logs (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const activityLogs = await base44.asServiceRole.entities.ActivityLog.filter({
      activity_type: 'routine_activity_completed'
    });

    const recentActivities = (activityLogs || []).filter(log => 
      log.created_date >= twoWeeksAgo.toISOString()
    );

    // Get anxiety trends
    const anxietyTrends = await base44.entities.AnxietyTrend.filter({
      date: { $gte: twoWeeksAgo.toISOString().split('T')[0] }
    });

    // Analyze adherence patterns
    const adherenceAnalysis = analyzeAdherence(routine, recentActivities);
    const moodCorrelations = analyzeMoodCorrelations(routine, anxietyTrends);

    // Generate adaptations
    const adaptations = generateAdaptations(
      routine,
      adherenceAnalysis,
      moodCorrelations
    );

    // Apply adaptations
    const updatedRoutine = applyAdaptations(routine, adaptations);

    // Save updated routine
    const saved = await base44.entities.DailyRoutinePattern.update(
      current_routine_id,
      {
        ...updatedRoutine,
        last_adapted: new Date().toISOString(),
        adaptation_notes: adaptations.summary
      }
    );

    return Response.json({
      success: true,
      updated_routine: saved,
      analysis: {
        adherence: adherenceAnalysis,
        mood_correlations: moodCorrelations,
        adaptations_made: adaptations.changes
      }
    });
  } catch (error) {
    console.error('Adapt routine error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

function analyzeAdherence(routine, activities) {
  const activityNames = routine.routine_activities.map(a => a.activity);
  const completedByActivity = {};
  const skippedByActivity = {};

  activityNames.forEach(name => {
    completedByActivity[name] = 0;
    skippedByActivity[name] = 0;
  });

  activities.forEach(log => {
    const activity = log.details?.activity_name;
    const completed = log.details?.completed;

    if (activity && completedByActivity.hasOwnProperty(activity)) {
      if (completed) {
        completedByActivity[activity]++;
      } else {
        skippedByActivity[activity]++;
      }
    }
  });

  const total = activities.length || 1;
  const completed = Object.values(completedByActivity).reduce((a, b) => a + b, 0);
  const adherenceRate = (completed / total) * 100;

  return {
    overall_adherence_rate: Math.round(adherenceRate),
    completed_by_activity: completedByActivity,
    skipped_by_activity: skippedByActivity,
    most_adhered: Object.entries(completedByActivity).sort((a, b) => b[1] - a[1])[0]?.[0],
    least_adhered: Object.entries(skippedByActivity).sort((a, b) => b[1] - a[1])[0]?.[0]
  };
}

function analyzeMoodCorrelations(routine, anxietyTrends) {
  if (!anxietyTrends || anxietyTrends.length === 0) {
    return { low_anxiety_times: [], high_anxiety_times: [] };
  }

  const lowAnxietyTimes = [];
  const highAnxietyTimes = [];

  anxietyTrends.forEach(trend => {
    if (trend.anxiety_level <= 3) {
      lowAnxietyTimes.push(trend.date);
    } else if (trend.anxiety_level >= 7) {
      highAnxietyTimes.push(trend.date);
    }
  });

  return {
    low_anxiety_times: lowAnxietyTimes,
    high_anxiety_times: highAnxietyTimes,
    average_anxiety: Math.round(
      anxietyTrends.reduce((sum, t) => sum + (t.anxiety_level || 0), 0) / anxietyTrends.length
    )
  };
}

function generateAdaptations(routine, adherence, mood) {
  const changes = [];
  const warnings = [];

  // If adherence is low, adjust timing
  if (adherence.overall_adherence_rate < 60) {
    changes.push({
      type: 'timing_adjustment',
      reason: 'Low overall adherence detected',
      recommendation: 'Shift activities to times when patient is most responsive'
    });
  }

  // If specific activity is frequently skipped
  if (adherence.least_adhered) {
    changes.push({
      type: 'activity_adjustment',
      activity: adherence.least_adhered,
      reason: 'Low completion rate for this activity',
      recommendation: `Increase reminder time or adjust presentation of "${adherence.least_adhered}"`
    });
  }

  // If anxiety correlates with specific times
  if (mood.high_anxiety_times.length > 0) {
    changes.push({
      type: 'anxiety_mitigation',
      reason: 'High anxiety detected during certain periods',
      recommendation: 'Introduce calming activities or adjust transitions'
    });
  }

  return {
    changes,
    warnings,
    summary: `Routine analyzed: ${adherence.overall_adherence_rate}% adherence. ${changes.length} adaptations recommended.`
  };
}

function applyAdaptations(routine, adaptations) {
  const updated = { ...routine };

  // Update adherence metrics
  updated.adherence_rate = 75; // Placeholder - would calculate from real data
  updated.days_tracked = (updated.days_tracked || 0) + 1;

  // Apply timing adjustments if needed
  adaptations.changes.forEach(change => {
    if (change.type === 'timing_adjustment') {
      // Shift less adhered activities to earlier times
      updated.routine_activities = updated.routine_activities.map(activity => {
        if (activity.activity === adaptations.changes[0]?.activity) {
          return {
            ...activity,
            scheduled_time: shiftTimeEarlier(activity.scheduled_time),
            reminder_minutes_before: Math.max(10, (activity.reminder_minutes_before || 5) + 5)
          };
        }
        return activity;
      });
    }
  });

  return updated;
}

function shiftTimeEarlier(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const earlier = Math.max(0, hours - 1);
  return `${String(earlier).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}