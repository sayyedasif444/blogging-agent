import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID!,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { plan, userEmail } = await request.json();

    // Define plan details
    const plans = {
      single: {
        name: 'Single Credit - 5 Credits',
        amount: 1000, // ₹10 in paise
        credits: 5,
        currency: 'INR'
      },
      starter: {
        name: 'Starter Plan - 60 Credits',
        amount: 10000, // ₹100 in paise
        credits: 60,
        currency: 'INR'
      },
      pro: {
        name: 'Pro Plan - 500 Credits',
        amount: 50000, // ₹500 in paise
        credits: 500,
        currency: 'INR'
      }
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      receipt: `blogtool_${Date.now()}`,
      notes: {
        userEmail: userEmail,
        plan: plan,
        credits: selectedPlan.credits.toString()
      }
    });

    return NextResponse.json({
      orderId: order.id,
      amount: selectedPlan.amount,
      currency: selectedPlan.currency,
      plan: plan,
      credits: selectedPlan.credits
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 