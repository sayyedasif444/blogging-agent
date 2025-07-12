import { NextRequest, NextResponse } from 'next/server';
import { updatePurchasedCredits, getUserData } from '@/lib/firebase';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID!,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userEmail, plan } = await request.json();

    console.log('Payment verification started for:', userEmail, 'Plan:', plan);

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.log('Payment verification failed - signature mismatch');
      
      // Initiate refund for failed verification
      try {
        console.log('Initiating refund for failed payment verification');
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 'full', // Refund the full amount
          speed: 'normal',
          notes: {
            reason: 'Payment verification failed - signature mismatch'
          }
        });
        console.log('Refund initiated successfully:', refund.id);
      } catch (refundError) {
        console.error('Failed to initiate refund:', refundError);
      }
      
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    console.log('Payment verification successful');

    // Get user data from database
    console.log('Getting user data for:', userEmail);
    const userData = await getUserData(userEmail);
    
    if (!userData) {
      console.log('User not found in database');
      
      // Initiate refund for user not found
      try {
        console.log('Initiating refund - user not found in database');
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 'full',
          speed: 'normal',
          notes: {
            reason: 'User not found in database'
          }
        });
        console.log('Refund initiated successfully:', refund.id);
      } catch (refundError) {
        console.error('Failed to initiate refund:', refundError);
      }
      
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User data retrieved successfully:', {
      email: userData.email,
      freeCredits: userData.freeCredits,
      purchasedCredits: userData.purchasedCredits,
      totalCredits: (userData.freeCredits || 0) + (userData.purchasedCredits || 0)
    });

    // Define credits for each plan
    const planCredits = {
      single: 5,
      starter: 60,
      pro: 500
    };

    // Calculate credits to add based on plan
    const creditsToAdd = planCredits[plan as keyof typeof planCredits] || 1;
    console.log(`Adding ${creditsToAdd} purchased credits for plan: ${plan}`);

    try {
      // Update purchased credits using the working function
      await updatePurchasedCredits(userEmail, creditsToAdd);
    } catch (updateError) {
      console.error('Failed to update credits:', updateError);
      
      // Initiate refund for credit update failure
      try {
        console.log('Initiating refund - failed to update credits');
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 'full',
          speed: 'normal',
          notes: {
            reason: 'Failed to update user credits'
          }
        });
        console.log('Refund initiated successfully:', refund.id);
      } catch (refundError) {
        console.error('Failed to initiate refund:', refundError);
      }
      
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      );
    }

    // Get updated user data
    const updatedUserData = await getUserData(userEmail);
    if (!updatedUserData) {
      console.log('Failed to get updated user data');
      
      // Initiate refund for failed data retrieval
      try {
        console.log('Initiating refund - failed to get updated user data');
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 'full',
          speed: 'normal',
          notes: {
            reason: 'Failed to get updated user data'
          }
        });
        console.log('Refund initiated successfully:', refund.id);
      } catch (refundError) {
        console.error('Failed to initiate refund:', refundError);
      }
      
      return NextResponse.json(
        { error: 'Failed to get updated user data' },
        { status: 500 }
      );
    }

    console.log('Updated user data:', {
      email: updatedUserData.email,
      freeCredits: updatedUserData.freeCredits,
      purchasedCredits: updatedUserData.purchasedCredits,
      totalCredits: (updatedUserData.freeCredits || 0) + (updatedUserData.purchasedCredits || 0)
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and purchased credits added successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      plan: plan,
      creditsAdded: creditsToAdd,
      userData: {
        email: updatedUserData.email,
        freeCredits: updatedUserData.freeCredits || 0,
        purchasedCredits: updatedUserData.purchasedCredits || 0,
        totalCredits: (updatedUserData.freeCredits || 0) + (updatedUserData.purchasedCredits || 0)
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    
    // Try to get payment_id from the request for refund
    try {
      const { razorpay_payment_id } = await request.json();
      if (razorpay_payment_id) {
        console.log('Initiating refund for general error');
        const refund = await razorpay.payments.refund(razorpay_payment_id, {
          amount: 'full',
          speed: 'normal',
          notes: {
            reason: 'General payment verification error'
          }
        });
        console.log('Refund initiated successfully:', refund.id);
      }
    } catch (refundError) {
      console.error('Failed to initiate refund for general error:', refundError);
    }
    
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
} 