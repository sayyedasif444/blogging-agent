import { NextRequest, NextResponse } from 'next/server';
import { initializeUserCredits, findUserByEmailReal, getCurrentUserCreditsReal } from '@/lib/firebase-real';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    console.log('Initializing user:', email);
    
    // Initialize user with new credit structure
    await initializeUserCredits(email);
    
    // Get user data after initialization
    const userDoc = await findUserByEmailReal(email);
    const currentCredits = await getCurrentUserCreditsReal(email);
    
    return NextResponse.json({
      success: true,
      message: 'User initialized successfully',
      user: {
        email: email,
        credits: {
          free: currentCredits.free,
          purchased: currentCredits.purchased,
          total: currentCredits.total
        },
        userData: userDoc ? userDoc.data() : null
      }
    });
    
  } catch (error) {
    console.error('User initialization error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 