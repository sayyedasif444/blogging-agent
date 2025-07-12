import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

interface BlogSettings {
  tone?: string;
  length?: string;
  includeHeadings?: boolean;
  includeConclusion?: boolean;
}

/**
 * Generates a detailed blog post in HTML format with customizable length and structure.
 * @param {string} title
 * @param {string} tone
 * @param {BlogSettings} settings
 * @returns {Promise<{html: string, wordCount: number}>}
 */
export async function writeBlogSections(title: string, tone: string, settings?: BlogSettings): Promise<{html: string, wordCount: number}> {
  try {
    // Determine word count based on length setting
    let targetWordCount = 1500; // default medium
    let maxTokens = 4096;
    
    if (settings?.length === 'short') {
      targetWordCount = 600;
      maxTokens = 2000;
    } else if (settings?.length === 'long') {
      targetWordCount = 2000;
      maxTokens = 6000;
    }

    // Build structure instructions based on settings
    let structureInstructions = '';
    if (settings?.includeHeadings) {
      structureInstructions += `
- Use <h2> tags for main section headings
- Structure the content with clear sections
- Each section should have a descriptive heading`;
    }
    
    if (settings?.includeConclusion) {
      structureInstructions += `
- Include a conclusion section at the end
- Summarize key points and provide a call to action`;
    }

    const systemPrompt = `You are an expert tech blogger. 
Write ${settings?.length || 'medium'}-length, structured HTML blog content with the following:

- Length: ${targetWordCount} words (${settings?.length || 'medium'} length)
- Tone: ${tone}
- HTML format: <h2>, <p>, <ul>, <strong>, etc.
- No <html> or <body> tags, just the content
- Use storytelling, analogies, examples to enrich the content
${structureInstructions}

Structure the content appropriately based on the settings provided.
You must:
- Use <h2>, <p>, <ul>, <strong>, etc.
- Follow the tone: ${tone}
- Add examples, storytelling, improved structure and transitions
- Target length: ${targetWordCount} words
- Output must NOT include <html> or <body> tags — only the content
- Make sure to add proper spacing between sections
`;

    const userPrompt = `Write a ${settings?.length || 'medium'}-length blog post on the topic: "${title}".`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    const html = response.choices[0].message.content?.trim() || '';
    return {
      html,
      wordCount: estimateWordCount(html),
    };
  } catch (error) {
    console.error('Blog generation failed:', error);
    return { html: '', wordCount: 0 };
  }
}

function estimateWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, ''); // strip tags
  return text.trim().split(/\s+/).length;
} 