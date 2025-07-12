'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { updateCreditsInLocalStorage } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  plan: 'single' | 'starter' | 'pro';
  planName: string;
  price: string;
  credits: number;
  userEmail: string;
  onSuccess?: (creditsAdded: number) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentButton({ 
  plan, 
  planName, 
  price, 
  credits, 
  userEmail,
  onSuccess 
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!userEmail) {
      alert('Please log in to purchase credits');
      return;
    }

    setLoading(true);

    try {
      // Get user data including phone number
      const userDataResponse = await fetch('/api/get-user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      let userPhone = '';
      if (userDataResponse.ok) {
        const userData = await userDataResponse.json();
        userPhone = userData.userData.phone || '';
      }

      // Create payment order
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const orderData = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || (() => {
          throw new Error('Razorpay key not configured');
        })(),
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Dev & Debate',
        description: `${planName} - ${credits} Credits`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setProcessing(true);
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail,
                plan,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Update localStorage with new credit information
              if (verifyData.userData) {
                updateCreditsInLocalStorage(verifyData.userData);
              }
              
              // Notify other components that credits have been updated
              localStorage.setItem('credits_updated', Date.now().toString());
              
              // Dispatch custom event for same-tab updates
              window.dispatchEvent(new Event('creditsUpdated'));
              
              onSuccess?.(credits);
              
              // Show success message and redirect
              setTimeout(() => {
                alert(`Payment successful! ${credits} credits have been added to your account.`);
                router.push('/blog-tool');
              }, 500);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          email: userEmail,
          contact: userPhone, // Pre-fill phone number to avoid asking for it
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={loading || processing}
      className={`w-full ${
        plan === 'pro'
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : plan === 'single'
          ? 'bg-green-600 hover:bg-green-700 text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying Payment...
        </>
      ) : (
        `Buy ${planName} - ${price}`
      )}
    </Button>
  );
} 