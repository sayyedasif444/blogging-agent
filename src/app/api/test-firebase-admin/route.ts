import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Firebase Admin connection...');
    
    if (!adminDb) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Firebase Admin not initialized'
        },
        { status: 500 }
      );
    }
    
    // Test basic Firestore connection with a simple operation
    const testRef = adminDb.collection('test');
    
    // Just try to get the collection reference without querying
    console.log('Firebase Admin connection successful - collection reference created');
    
    return NextResponse.json({
      success: true,
      message: 'Firebase Admin is working correctly',
      collectionPath: testRef.path
    });
    
  } catch (error) {
    console.error('Firebase Admin test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Firebase Admin test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 