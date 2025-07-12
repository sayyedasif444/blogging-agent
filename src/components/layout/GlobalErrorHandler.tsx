'use client';

import { useEffect } from 'react';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export default function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  useEffect(() => {
    // Handle hydration mismatch errors gracefully
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0];
      
      // Check if this is a hydration mismatch error
      if (typeof message === 'string' && 
          (message.includes('hydration') || 
           message.includes('server rendered HTML') ||
           message.includes('client properties'))) {
        
        // Log the error but don't show it to the user
        console.warn('Hydration mismatch detected and handled:', message);
        return;
      }
      
      // For all other errors, use the original console.error
      originalConsoleError.apply(console, args);
    };

    // Clean up browser extension attributes that cause hydration issues
    const cleanupExtensions = () => {
      const body = document.body;
      if (body) {
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
      }
    };

    // Run cleanup immediately and after a short delay
    cleanupExtensions();
    const timeoutId = setTimeout(cleanupExtensions, 100);

    return () => {
      console.error = originalConsoleError;
      clearTimeout(timeoutId);
    };
  }, []);

  return <>{children}</>;
} 