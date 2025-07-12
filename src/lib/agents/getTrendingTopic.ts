// lib/agents/getTrendingTopic.ts
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false
});

/**
 * Convert a user idea into a trending blog topic.
 * @param {string} idea - e.g. "AI in education"
 * @returns {Promise<string | null>} - e.g. "How AI is Reshaping Classrooms in 2025"
 */
export async function getTrendingTopicFromIdea(idea: string): Promise<string | null> {
  
  try {
    console.log('🎯 Generating title for idea:', idea);
    
    const prompt = `You're a blog title strategist. Given the raw idea: "${idea}", generate a catchy and trending blog title that feels fresh and aligns with current online trends. Do not use hashtags or dates unless needed.`;
    
    console.log('📝 Using prompt:', prompt);

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      max_tokens: 60,
    });

    console.log('🤖 OpenAI response:', completion);
    console.log('📄 Choices:', completion.choices);
    
    const title = completion.choices[0]?.message?.content?.trim() || null;
    
    console.log('🏷️ Generated title:', title);
    
    if (!title) {
      console.error('❌ Title is null or empty');
      // Fallback: use the original idea as title
      return `${idea} - A Comprehensive Guide`;
    }
    
    return title;
  } catch (error) {
    console.error('💥 Error in getTrendingTopicFromIdea:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Fallback: use the original idea as title
    console.log('🔄 Using fallback title');
    return `${idea} - A Comprehensive Guide`;
  }
} 