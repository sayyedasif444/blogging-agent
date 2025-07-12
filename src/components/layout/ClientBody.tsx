'use client';

import { useEffect, useState } from 'react';
import LoadingState from './LoadingState';

interface ClientBodyProps {
  className: string;
  children: React.ReactNode;
}

export default function ClientBody({ className, children }: ClientBodyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Additional effect to clean up browser extension attributes after hydration
  useEffect(() => {
    if (mounted) {
      // Use a timeout to ensure this runs after hydration is complete
      const timeoutId = setTimeout(() => {
        const body = document.body;
        if (body) {
          // Remove common browser extension attributes that cause hydration issues
          const extensionAttributes = [
            'cz-shortcut-listen',
            'data-new-gr-c-s-check-loaded',
            'data-gr-ext-installed',
            'data-gramm',
            'data-gramm_editor',
            'data-gramm_id'
          ];
          
          extensionAttributes.forEach(attr => {
            if (body.hasAttribute(attr)) {
              body.removeAttribute(attr);
            }
          });

          // Also clean up any data attributes that might be added by extensions
          const allAttributes = Array.from(body.attributes);
          allAttributes.forEach(attr => {
            if (attr.name.startsWith('data-') && 
                (attr.name.includes('gramm') || 
                 attr.name.includes('cz-') || 
                 attr.name.includes('new-gr'))) {
              body.removeAttribute(attr.name);
            }
          });
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [mounted]);

  // Return a loading state during SSR
  if (!mounted) {
    return (
      <body className={className}>
        <LoadingState />
      </body>
    );
  }

  // Once mounted on client, return the actual content with hydration warning suppressed
  return (
    <body 
      className={className}
      suppressHydrationWarning={true}
    >
      {children}
    </body>
  );
} 