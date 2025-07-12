import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmailReal, getCurrentUserCreditsReal } from '@/lib/firebase-real';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'sayyedasif444@gmail.com';
    
    console.log('Testing real Firebase with email:', email);
    
    const userDoc = await findUserByEmailReal(email);
    const currentCredits = await getCurrentUserCreditsReal(email);
    
    return NextResponse.json({
      success: true,
      message: 'Real Firebase is working correctly',
      userFound: !!userDoc,
      credits: {
        free: currentCredits.free,
        purchased: currentCredits.purchased,
        total: currentCredits.total
      },
      userData: userDoc ? userDoc.data() : null
    });
    
  } catch (error) {
    console.error('Real Firebase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Real Firebase test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 