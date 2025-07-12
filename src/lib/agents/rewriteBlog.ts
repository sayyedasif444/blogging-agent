import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false,
});

interface BlogContent {
  html: string;
  wordCount: number;
}

/**
 * Rewrites blog content in HTML (1000–2000 words) based on feedback + tone.
 * @param {object} blog - { html, wordCount }
 * @param {string} feedback - Editor/critic feedback
 * @param {string} tone - Desired tone
 * @param {string} title - Blog topic/title
 * @returns {Promise<{html: string, wordCount: number}>}
 */
export async function rewriteBlogWithFeedback(blog: BlogContent, feedback: string, tone: string, title: string): Promise<BlogContent> {
  try {
    const originalText = [blog.html].join('\n\n');

    const systemPrompt = `You are a professional editor for a tech blog.

Your task is to rewrite the following blog content in clean HTML format. 
You must:
- Use <h2>, <p>, <ul>, <strong>, etc.
- Structure the blog with <h2>Introduction</h2>, <h2>Main Body</h2>, <h2>Conclusion</h2>
- Follow the tone: ${tone}
- Apply this editor feedback: ${feedback}
- Add examples, storytelling, improved structure and transitions
- Minimum length: 1000 words
- Ideal length: 1500–2000 words
- Output must NOT include <html> or <body> tags — only the content
- do not use words like main body, introduction, conclusion, etc. instead use the meaningful and creative titles for it with proper html tags and style. Make sure to add br after each section.
`;

    const userPrompt = `The blog titled "${title}" needs improvement.

ORIGINAL CONTENT:
"""
${originalText}
"""
Please rewrite it using the above rules.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 4096,
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
    console.error('❌ Rewrite failed:', error);
    return {
      html: [blog.html].map(p => `<p>${p}</p>`).join('\n'),
      wordCount: estimateWordCount(blog.html),
    };
  }
}

/**
 * Remove HTML tags and estimate word count.
 */
function estimateWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  return text.trim().split(/\s+/).length;
} 