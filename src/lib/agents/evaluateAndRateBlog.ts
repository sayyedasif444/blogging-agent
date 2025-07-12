// lib/agents/evaluateAndRateBlog.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

/**
 * Evaluates blog text based on tone and structure, returns rating + feedback.
 * @param {string} blogText - Full blog (combined paras)
 * @param {string} tone - Desired tone (e.g. friendly, informative)
 * @returns {Promise<{score: number, review: string}>}
 */
export async function evaluateAndRateBlog(blogText: string, tone: string): Promise<{score: number, review: string}> {
  try {
    const prompt = `
You're a senior content editor.

Evaluate the following blog based on:
1. Tone matching: "${tone}"
2. Structure: Intro, Body, Conclusion
3. Overall readability and usefulness

BLOG:
"""${blogText}"""

Give your rating from 1 to 10 and a short review (2-3 lines). Respond strictly in this JSON format:

{
  "score": <number>,
  "review": "<short feedback>"
}
`;

    const result = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.4,
      max_tokens: 200
    });

    const raw = result.choices[0].message.content?.trim() || '';

    const json = JSON.parse(raw);
    return json;
  } catch (error) {
    console.error('Rating agent failed:', error);
    return { score: 0, review: 'Evaluation failed.' };
  }
} 