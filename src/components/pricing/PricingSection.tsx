'use client';

import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '/create',
    price: '₹0',
    description: 'Start creating blogs right away with our free tier.',
    features: [
      '2 blogs per day',
      'AI-powered blog creation',
      'HTML & PDF downloads',
      'Basic formatting options',
      'Community support'
    ],
    cta: 'Start Creating',
    featured: false
  },
  {
    name: 'Credits Pack',
    id: 'tier-pro',
    href: '/credits',
    price: '₹100',
    description: 'Need more blogs? Get our affordable credits pack.',
    features: [
      '10 blog credits',
      'No daily limits',
      'AI-powered blog creation',
      'HTML & PDF downloads',
      'Priority support',
      'Credits never expire',
      'Buy more anytime'
    ],
    cta: 'Buy Credits',
    featured: true
  }
];

export default function PricingSection() {
  return (
    <div className="relative isolate bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Simple Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Create blogs your way
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start with our free tier or get more credits when you need them. No subscriptions, no commitments.
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl bg-white dark:bg-gray-800 p-8 ring-1 ring-gray-200 dark:ring-gray-700 xl:p-10 ${
                tier.featured ? 'relative lg:z-10 lg:shadow-xl' : ''
              } ${
                tierIdx === 0 ? 'lg:rounded-r-none' : 'lg:rounded-l-none'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3
                    id={tier.id}
                    className={`text-lg font-semibold leading-8 ${
                      tier.featured ? 'text-primary' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  {tier.featured && (
                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                      Most flexible
                    </p>
                  )}
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">{tier.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{tier.price}</span>
                  {tier.featured ? (
                    <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">for 10 credits</span>
                  ) : (
                    <span className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-300">forever</span>
                  )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.featured
                    ? 'bg-primary text-white shadow-sm hover:bg-primary/90 focus-visible:outline-primary'
                    : 'text-primary ring-1 ring-inset ring-primary/20 hover:ring-primary/30'
                }`}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Simple explanation box */}
        <div className="mt-16 mx-auto max-w-2xl rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Just a Blog Creation Tool
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            No complicated features, no subscriptions. Simply create blogs and download them in HTML or PDF format.
            Start with 2 free blogs per day, or get more credits when you need them.
          </p>
        </div>
      </div>
    </div>
  );
} 