import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    const userData = await getUserData(userEmail);
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without sensitive information
    return NextResponse.json({
      success: true,
      userData: {
        email: userData.email,
        phone: userData.phone,
        freeCredits: userData.freeCredits || 0,
        purchasedCredits: userData.purchasedCredits || 0,
        totalCredits: (userData.freeCredits || 0) + (userData.purchasedCredits || 0)
      }
    });

  } catch (error) {
    console.error('Error getting user data:', error);
    return NextResponse.json(
      { error: 'Failed to get user data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 