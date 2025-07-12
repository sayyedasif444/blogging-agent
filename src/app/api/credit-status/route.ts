import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmailReal, getCurrentUserCreditsReal, getNextResetTime } from '@/lib/firebase-real';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }
    
    console.log('Checking credit status for:', email);
    
    const userDoc = await findUserByEmailReal(email);
    const currentCredits = await getCurrentUserCreditsReal(email);
    const nextResetTime = await getNextResetTime(email);
    
    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const userData = userDoc.data();
    
    return NextResponse.json({
      success: true,
      user: {
        email: userData.email,
        credits: {
          free: currentCredits.free,
          purchased: currentCredits.purchased,
          total: currentCredits.total
        },
        lastFreeCreditReset: userData.lastFreeCreditReset,
        nextResetTime: nextResetTime,
        lastUpdated: userData.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Credit status check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check credit status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 