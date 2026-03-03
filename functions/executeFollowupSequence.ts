import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all active enrollments due for next step
    const now = new Date();
    
    const enrollments = await base44.asServiceRole.entities.SequenceEnrollment.filter({
      status: 'active'
    });

    let processed = 0;
    let sent = 0;
    let errors = 0;

    for (const enrollment of enrollments) {
      try {
        if (!enrollment.next_step_scheduled || new Date(enrollment.next_step_scheduled) > now) {
          continue;
        }

        // Get sequence
        const sequence = await base44.asServiceRole.entities.AutomatedSequence.read(enrollment.sequence_id);
        if (!sequence) continue;

        const currentStep = sequence.steps[enrollment.current_step - 1];
        if (!currentStep) {
          // Sequence completed
          await base44.asServiceRole.entities.SequenceEnrollment.update(enrollment.id, { status: 'completed', completed_at: now.toISOString() });
          continue;
        }

        // Check if previous step condition was met
        let shouldProceed = true;
        if (currentStep.condition && currentStep.condition.from_previous_step && enrollment.engagement_history && enrollment.engagement_history.length > 0) {
          const previousStep = enrollment.engagement_history[enrollment.engagement_history.length - 1];
          shouldProceed = evaluateCondition(currentStep.condition.type, previousStep);
        }

        if (!shouldProceed) {
          // Skip to alternate branch
          if (currentStep.next_step_on_condition_not_met) {
            await updateEnrollmentStep(base44, enrollment.id, currentStep.next_step_on_condition_not_met);
          } else {
            await base44.asServiceRole.entities.SequenceEnrollment.update(enrollment.id, { status: 'completed' });
          }
          continue;
        }

        // Send the email using generatePersonalizedOutreach
        const leadData = {
          email: enrollment.lead_email,
          name: enrollment.lead_email.split('@')[0] // Fallback
        };

        const response = await base44.functions.invoke('generatePersonalizedOutreach', {
          leadId: enrollment.lead_id,
          campaignId: 'sequence_' + enrollment.sequence_id,
          templateId: currentStep.template_id,
          leadData: leadData
        });

        if (response.data && !response.data.error) {
          sent++;
          
          // Update enrollment
          const engagementEntry = {
            step: enrollment.current_step,
            template_id: currentStep.template_id,
            sent_at: now.toISOString(),
            variant_used: response.data.variant_used
          };

          const updatedHistory = [...(enrollment.engagement_history || []), engagementEntry];
          
          const nextStep = currentStep.next_step_on_condition_met || enrollment.current_step + 1;
          const delayDays = sequence.steps[nextStep - 1]?.delay_days || 3;
          const nextScheduled = new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000);

          await base44.asServiceRole.entities.SequenceEnrollment.update(enrollment.id, {
            current_step: nextStep,
            last_step_sent: now.toISOString(),
            next_step_scheduled: nextScheduled.toISOString(),
            engagement_history: updatedHistory
          });
        }
        processed++;
      } catch (err) {
        console.error('Error processing enrollment:', err);
        errors++;
      }
    }

    return Response.json({
      processed,
      sent,
      errors,
      message: `Processed ${processed} enrollments, sent ${sent} emails`
    });
  } catch (error) {
    console.error('Error executing follow-up sequence:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function evaluateCondition(type, previousStep) {
  if (type === 'email_opened') {
    return !!previousStep.opened_at;
  } else if (type === 'link_clicked') {
    return !!previousStep.clicked_at;
  } else if (type === 'no_engagement') {
    return !previousStep.opened_at && !previousStep.clicked_at;
  } else if (type === 'any') {
    return true;
  }
  return false;
}

async function updateEnrollmentStep(base44, enrollmentId, nextStep) {
  const enrollment = await base44.asServiceRole.entities.SequenceEnrollment.read(enrollmentId);
  const sequence = await base44.asServiceRole.entities.AutomatedSequence.read(enrollment.sequence_id);
  
  const delayDays = sequence.steps[nextStep - 1]?.delay_days || 3;
  const nextScheduled = new Date(Date.now() + delayDays * 24 * 60 * 60 * 1000);

  await base44.asServiceRole.entities.SequenceEnrollment.update(enrollmentId, {
    current_step: nextStep,
    next_step_scheduled: nextScheduled.toISOString()
  });
}