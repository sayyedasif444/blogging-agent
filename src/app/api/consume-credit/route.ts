import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmailReal, consumeCreditsReal } from '@/lib/firebase-real';

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

    const creditUsed = await consumeCreditsReal(userDoc, 1);
    if (!creditUsed) {
      return NextResponse.json(
        { error: 'Failed to consume credit' },
        { status: 500 }
      );
    }

    // Get updated user data
    const updatedUserDoc = await findUserByEmailReal(userEmail);
    if (!updatedUserDoc) {
      return NextResponse.json(
        { error: 'Failed to get updated user data' },
        { status: 500 }
      );
    }

    const updatedUserData = updatedUserDoc.data();
    
    return NextResponse.json({
      success: true,
      remainingCredits: updatedUserData.totalCredits || 0,
      freeCredits: updatedUserData.freeCredits || 0,
      purchasedCredits: updatedUserData.purchasedCredits || 0
    });

  } catch (error) {
    console.error('Error consuming credit:', error);
    return NextResponse.json(
      { error: 'Failed to consume credit', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 