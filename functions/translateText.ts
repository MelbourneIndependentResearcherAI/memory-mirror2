import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, targetLanguage, sourceLanguage } = await req.json();

    if (!text || !targetLanguage) {
      return Response.json({ error: 'Missing required fields: text, targetLanguage' }, { status: 400 });
    }

    // Skip translation if target is English and source is not specified
    if (targetLanguage === 'en' && !sourceLanguage) {
      return Response.json({ translatedText: text, detectedLanguage: 'en' });
    }

    // Language names for better prompting
    const languageNames = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
      pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ko: 'Korean', ar: 'Arabic',
      hi: 'Hindi', ru: 'Russian', nl: 'Dutch', pl: 'Polish', tr: 'Turkish',
      vi: 'Vietnamese', th: 'Thai', sv: 'Swedish', no: 'Norwegian', da: 'Danish'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] : 'the detected language';

    // Use LLM for translation with context preservation
    const translationPrompt = sourceLanguage
      ? `Translate the following text from ${sourceLangName} to ${targetLangName}. 
         Preserve the emotional tone, context, and any cultural nuances. 
         If the text contains references to specific time periods, locations, or personal names, keep them intact.
         
         Text to translate: "${text}"
         
         Respond with ONLY the translated text, nothing else.`
      : `Translate the following text to ${targetLangName}. 
         First detect the source language, then translate.
         Preserve the emotional tone, context, and any cultural nuances.
         If the text contains references to specific time periods, locations, or personal names, keep them intact.
         
         Text to translate: "${text}"
         
         Respond with ONLY the translated text, nothing else.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: translationPrompt
    });

    const translatedText = typeof response === 'string' ? response.trim() : text;

    return Response.json({
      translatedText,
      originalText: text,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto-detected'
    });

  } catch (error) {
    console.error('Translation error:', error);
    return Response.json({ 
      error: 'Translation failed', 
      details: error.message 
    }, { status: 500 });
  }
});