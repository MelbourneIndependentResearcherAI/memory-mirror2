import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { leadId, campaignId, templateId, leadData } = await req.json();

    if (!leadData || !templateId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get template
    const template = await base44.asServiceRole.entities.OutreachTemplate.read(templateId);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check for active A/B test
    const tests = await base44.asServiceRole.entities.ABTestVariant.filter({
      template_id: templateId,
      status: 'running'
    });

    let bodyContent = template.body;
    let subjectLine = template.subject_line;
    let ctaText = template.cta_text;
    let variant = null;

    if (tests.length > 0) {
      const test = tests[0];
      const useVariantB = Math.random() * 100 > (test.split_ratio || 50);
      
      if (useVariantB && test.variant_type === 'subject_line') {
        subjectLine = test.variant_b_value;
        variant = 'b';
      } else if (!useVariantB && test.variant_type === 'subject_line') {
        subjectLine = test.variant_a_value;
        variant = 'a';
      }

      if (test.variant_type === 'body') {
        bodyContent = useVariantB ? test.variant_b_value : test.variant_a_value;
        variant = useVariantB ? 'b' : 'a';
      }

      if (test.variant_type === 'cta_text') {
        ctaText = useVariantB ? test.variant_b_value : test.variant_a_value;
        variant = useVariantB ? 'b' : 'a';
      }
    }

    // Personalize content with lead data
    const personalizedBody = personalizeContent(bodyContent, leadData);
    const personalizedSubject = personalizeContent(subjectLine, leadData);
    const personalizedCta = personalizeContent(ctaText, leadData);
    const personalizedUrl = personalizeContent(template.cta_url || '', leadData);

    const result = {
      subject_line: personalizedSubject,
      body: personalizedBody,
      cta_text: personalizedCta,
      cta_url: personalizedUrl,
      channel: template.channel,
      variant_used: variant,
      test_id: tests.length > 0 ? tests[0].id : null
    };

    // Log outreach event if leadId provided
    if (leadId && campaignId) {
      await base44.asServiceRole.entities.OutreachEvent.create({
        lead_id: leadId,
        campaign_id: campaignId,
        template_id: templateId,
        channel: template.channel,
        variant: variant,
        subject_line: personalizedSubject,
        body_preview: personalizedBody.substring(0, 200)
      });
    }

    return Response.json(result);
  } catch (error) {
    console.error('Error generating outreach:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function personalizeContent(content, leadData) {
  if (!content) return '';
  
  let personalized = content;
  
  // Replace {{name}}
  if (leadData.name) {
    personalized = personalized.replace(/\{\{name\}\}/g, leadData.name);
  }
  
  // Replace {{email}}
  if (leadData.email) {
    personalized = personalized.replace(/\{\{email\}\}/g, leadData.email);
  }
  
  // Replace {{source}}
  if (leadData.source) {
    personalized = personalized.replace(/\{\{source\}\}/g, leadData.source);
  }
  
  // Replace {{role}}
  if (leadData.role) {
    personalized = personalized.replace(/\{\{role\}\}/g, leadData.role);
  }
  
  // Add more variables as needed
  Object.keys(leadData).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    personalized = personalized.replace(regex, leadData[key]);
  });
  
  return personalized;
}