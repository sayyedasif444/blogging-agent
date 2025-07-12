import { NextRequest, NextResponse } from 'next/server';
import { getUserDataAdmin, updatePurchasedCreditsAdmin, consumeCreditsAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, action, credits } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Get current user data
    const userData = await getUserDataAdmin(userEmail);
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('Current user data:', {
      email: userData.email,
      freeCredits: userData.freeCredits,
      purchasedCredits: userData.purchasedCredits,
      totalCredits: (userData.freeCredits || 0) + (userData.purchasedCredits || 0)
    });

    let result = {};

    if (action === 'add') {
      // Add purchased credits
      const creditsToAdd = credits || 10;
      await updatePurchasedCreditsAdmin(userEmail, creditsToAdd);
      
      const updatedUserData = await getUserDataAdmin(userEmail);
      result = {
        action: 'add',
        creditsAdded: creditsToAdd,
        newFreeCredits: updatedUserData?.freeCredits || 0,
        newPurchasedCredits: updatedUserData?.purchasedCredits || 0,
        newTotalCredits: (updatedUserData?.freeCredits || 0) + (updatedUserData?.purchasedCredits || 0)
      };
    } else if (action === 'consume') {
      // Consume credits
      const remainingCredits = await consumeCreditsAdmin(userEmail);
      
      const updatedUserData = await getUserDataAdmin(userEmail);
      result = {
        action: 'consume',
        remainingCredits,
        newFreeCredits: updatedUserData?.freeCredits || 0,
        newPurchasedCredits: updatedUserData?.purchasedCredits || 0,
        newTotalCredits: (updatedUserData?.freeCredits || 0) + (updatedUserData?.purchasedCredits || 0)
      };
    } else {
      // Just return current status
      result = {
        action: 'status',
        freeCredits: userData.freeCredits || 0,
        purchasedCredits: userData.purchasedCredits || 0,
        totalCredits: (userData.freeCredits || 0) + (userData.purchasedCredits || 0)
      };
    }

    return NextResponse.json({
      success: true,
      userEmail,
      ...result
    });

  } catch (error) {
    console.error('Test purchased credits error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 