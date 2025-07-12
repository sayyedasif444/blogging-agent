import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { findUserByEmailReal, consumeCreditsReal } from '@/lib/firebase-real';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { topic, settings, userEmail } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Check user credits before generating
    const userDoc = await findUserByEmailReal(userEmail);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const totalCredits = (userData.freeCredits || 0) + (userData.purchasedCredits || 0);
    
    if (totalCredits < 1) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          details: {
            freeCredits: userData.freeCredits || 0,
            purchasedCredits: userData.purchasedCredits || 0,
            totalCredits: totalCredits
          }
        },
        { status: 402 }
      );
    }

    // Use 1 credit for blog generation
    const creditUsed = await consumeCreditsReal(userDoc, 1);
    if (!creditUsed) {
      return NextResponse.json(
        { error: 'Failed to use credits' },
        { status: 500 }
      );
    }

    console.log(`Blog generation started for ${userEmail}. Credits used: 1`);

    // Build the prompt based on settings
    let prompt = `Write a blog post about: ${topic}.`;
    
    if (settings) {
      prompt += `\n\nRequirements:`;
      prompt += `\n- Tone: ${settings.tone}`;
      prompt += `\n- Length: ${settings.length}`;
      
      if (settings.includeHeadings) {
        prompt += `\n- Include section headings with <h2> tags`;
      }
      
      if (settings.includeConclusion) {
        prompt += `\n- Include a conclusion section`;
      }
    }

    prompt += `\n\nFormat the response as JSON with 'title' and 'content' fields. The content should be in HTML format with appropriate tags (p, h2, ul, etc.).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional blog writer. Write engaging, well-researched blog posts that are informative and easy to read. Include a catchy title."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: settings?.length === 'long' ? 3000 : settings?.length === 'medium' ? 2000 : 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e);
      throw new Error('Invalid response format from OpenAI');
    }

    // Get updated user data after credit usage
    const updatedUserDoc = await findUserByEmailReal(userEmail);
    if (!updatedUserDoc) {
      return NextResponse.json(
        { error: 'Failed to get updated user data' },
        { status: 500 }
      );
    }

    const updatedUserData = updatedUserDoc.data() as any;

    return NextResponse.json({
      ...parsedResponse,
      credits: {
        free: updatedUserData.freeCredits || 0,
        purchased: updatedUserData.purchasedCredits || 0,
        total: updatedUserData.totalCredits || 0
      }
    });
  } catch (error) {
    console.error('Error generating blog:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
} 