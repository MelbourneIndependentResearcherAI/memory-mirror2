import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { sequenceId } = await req.json();

    // Get the sequence
    const sequence = await base44.asServiceRole.entities.AutomatedSequence.read(sequenceId);
    if (!sequence) {
      return Response.json({ error: 'Sequence not found' }, { status: 404 });
    }

    let optimized = 0;
    const recommendations = [];

    // For each step, find related A/B tests and analyze performance
    for (let i = 0; i < sequence.steps.length; i++) {
      const step = sequence.steps[i];
      if (!step.enable_ab_testing) continue;

      // Find completed A/B tests for this template
      const tests = await base44.asServiceRole.entities.ABTestVariant.filter({
        template_id: step.template_id,
        status: 'completed'
      });

      for (const test of tests) {
        if (!test.metrics) continue;

        const aConversionRate = test.metrics.variant_a_conversions / (test.metrics.variant_a_sent || 1);
        const bConversionRate = test.metrics.variant_b_conversions / (test.metrics.variant_b_sent || 1);

        const winner = aConversionRate > bConversionRate ? 'a' : 'b';
        const improvement = Math.abs(aConversionRate - bConversionRate) * 100;

        if (improvement > 5) {
          recommendations.push({
            step_number: i + 1,
            test_name: test.test_name,
            variant_type: test.variant_type,
            winner: winner,
            improvement_percentage: improvement.toFixed(2),
            recommended_action: `Replace template variant with ${winner.toUpperCase()} (${improvement.toFixed(2)}% improvement)`
          });

          optimized++;
        }
      }
    }

    // Update sequence stats from enrollments
    const enrollments = await base44.asServiceRole.entities.SequenceEnrollment.filter({
      sequence_id: sequenceId
    });

    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;
    let totalConversions = 0;

    for (const enrollment of enrollments) {
      if (enrollment.engagement_history) {
        totalSent += enrollment.engagement_history.length;
        totalOpened += enrollment.engagement_history.filter(e => e.opened_at).length;
        totalClicked += enrollment.engagement_history.filter(e => e.clicked_at).length;
      }
    }

    const conversionRate = totalSent > 0 ? (totalClicked / totalSent * 100) : 0;

    await base44.asServiceRole.entities.AutomatedSequence.update(sequenceId, {
      stats: {
        total_sent: totalSent,
        total_opened: totalOpened,
        total_clicked: totalClicked,
        total_conversions: totalConversions,
        conversion_rate: parseFloat(conversionRate.toFixed(2))
      }
    });

    return Response.json({
      sequence_id: sequenceId,
      optimized: optimized,
      recommendations: recommendations,
      stats: {
        total_sent: totalSent,
        open_rate: (totalOpened / (totalSent || 1) * 100).toFixed(2) + '%',
        click_rate: (totalClicked / (totalSent || 1) * 100).toFixed(2) + '%'
      }
    });
  } catch (error) {
    console.error('Error optimizing sequence:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});