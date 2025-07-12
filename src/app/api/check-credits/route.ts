import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmailReal, getCurrentUserCreditsReal } from '@/lib/firebase-real';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const userDoc = await findUserByEmailReal(userEmail);
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const credits = {
      freeCredits: userData.freeCredits || 0,
      purchasedCredits: userData.purchasedCredits || 0,
      totalCredits: userData.totalCredits || 0,
      canGenerate: (userData.freeCredits || 0) + (userData.purchasedCredits || 0) > 0
    };
    
    return NextResponse.json({
      success: true,
      ...credits
    });

  } catch (error) {
    console.error('Error checking credits:', error);
    return NextResponse.json(
      { error: 'Failed to check credits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 