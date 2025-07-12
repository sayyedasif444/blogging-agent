'use client';

import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import PaymentButton from '@/components/payment/PaymentButton';
import { useState } from 'react';

export default function PricingPage() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const plans = [
    {
      id: 'single',
      name: 'Single Credit',
      price: '₹10',
      credits: 5,
      description: 'Perfect for trying out our AI blog generation',
      features: [
        '5 AI blog generations',
        'All content lengths (Short, Medium, Long)',
        'All tone options',
        'PDF & HTML downloads',
        'Image suggestions',
        'AI quality ratings',
        'Basic support'
      ],
      popular: false,
      buttonText: 'Buy 5 Credits',
      buttonVariant: 'outline' as const
    },
    {
      id: 'starter',
      name: 'Starter',
      price: '₹100',
      credits: 60,
      description: 'Perfect for getting started with AI blog generation',
      features: [
        '60 AI blog generations',
        'All content lengths (Short, Medium, Long)',
        'All tone options',
        'PDF & HTML downloads',
        'Image suggestions',
        'AI quality ratings',
        'Email support'
      ],
      popular: false,
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹500',
      credits: 500,
      description: 'Best value for content creators and professionals',
      features: [
        '500 AI blog generations',
        'All content lengths (Short, Medium, Long)',
        'All tone options',
        'PDF & HTML downloads',
        'Image suggestions',
        'AI quality ratings',
        'Priority email support'
      ],
      popular: true,
      buttonText: 'Get Pro',
      buttonVariant: 'default' as const
    }
  ];

  const handlePaymentSuccess = (creditsAdded: number) => {
    // Trigger a refresh of the user's credit information
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 text-white border-gray-600 hover:bg-gray-800">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          
          {user && (
            <div className="text-right">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-white font-medium">{user.email}</p>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your AI blog generation needs. 
            All plans include our advanced AI technology and premium features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative bg-gray-900/80 border-gray-700 hover:border-gray-600 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 mb-4">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {plan.price}
                    </div>
                    <div className="text-lg text-gray-400">
                      {plan.credits} Credits
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ₹{Math.round(parseInt(plan.price.replace('₹', '')) / plan.credits * 100) / 100} per credit
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {user ? (
                    <PaymentButton
                      plan={plan.id as 'single' | 'starter' | 'pro'}
                      planName={plan.name}
                      price={plan.price}
                      credits={plan.credits}
                      userEmail={user.email}
                      onSuccess={handlePaymentSuccess}
                    />
                  ) : (
                    <Link href="/blog-tool">
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-600'
                        }`}
                        variant={plan.buttonVariant}
                      >
                        Sign In to Purchase
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                What are credits?
              </h3>
              <p className="text-gray-300">
                Credits are used to generate AI blog posts. Each blog generation consumes 1 credit, regardless of the length or complexity of the content.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                How long do credits last?
              </h3>
              <p className="text-gray-300">
                Credits have a validity period. Single credit expires after 7 days, Starter plan credits expire after 30 days, while Pro plan credits are valid for 90 days from purchase.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I get a refund?
              </h3>
              <p className="text-gray-300">
                We offer refunds for unused credits within 7 days of purchase. Please refer to our cancellation and refund policy for more details.
              </p>
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-300">
                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay. All payments are processed securely.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-gray-300 mb-6">
            Choose your plan and start generating amazing content today.
          </p>
          <Link href="/blog-tool">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Try for Free First
            </Button>
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            Get 2 free blog generations before choosing a plan
          </p>
        </div>
      </div>
    </div>
  );
} 