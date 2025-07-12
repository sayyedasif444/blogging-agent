import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, phone } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Get user document reference
    const db = getFirestore();
    const userQuery = query(
      collection(db, 'blogtool_auth'),
      where('email', '==', userEmail.toLowerCase())
    );
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update phone number
    await updateDoc(doc(db, 'blogtool_auth', userSnapshot.docs[0].id), {
      phone: phone
    });

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      phone: phone
    });

  } catch (error) {
    console.error('Error updating phone number:', error);
    return NextResponse.json(
      { error: 'Failed to update phone number', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 