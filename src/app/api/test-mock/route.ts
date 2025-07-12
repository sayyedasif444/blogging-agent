import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, getCurrentUserCredits } from '@/lib/firebase-mock';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'sayyedasif444@gmail.com';
    
    console.log('Testing mock Firebase with email:', email);
    
    const userDoc = await findUserByEmail(email);
    const currentCredits = getCurrentUserCredits(email);
    
    return NextResponse.json({
      success: true,
      message: 'Mock Firebase is working correctly',
      userFound: !!userDoc,
      credits: {
        free: currentCredits.free,
        purchased: currentCredits.purchased,
        total: currentCredits.total
      },
      userData: userDoc ? userDoc.data() : null
    });
    
  } catch (error) {
    console.error('Mock Firebase test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Mock Firebase test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 