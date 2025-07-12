import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

export async function GET() {
  try {
    // Test Firebase connection
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase not initialized. Check environment variables.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase is properly configured',
      firestore: !!db,
      collection: 'blogtool_auth',
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    return NextResponse.json(
      { error: 'Firebase test failed', details: error },
      { status: 500 }
    );
  }
} 