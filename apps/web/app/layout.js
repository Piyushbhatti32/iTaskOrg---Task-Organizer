"use client";

import { useEffect, useState } from 'react';
import ClientLayout from './ClientLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import { isMobileApp } from '@/lib/platform';

export default function RootLayout({ children }) {
  const [initError, setInitError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // No initialization needed with Firebase redirect flow
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ✅ Suppress console.error spam for user cancellations in development
  // This reduces Next.js dev overlay noise without hiding real errors
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const originalError = console.error;
    console.error = (...args) => {
      const message = typeof args[0] === 'string' ? args[0] : '';
      
      // Suppress user cancellation messages
      const isCancellationError = 
        message.includes('canceled') ||
        message.includes('cancelled') ||
        message.includes('user_cancelled') ||
        message.includes('User canceled the sign-in flow');
      
      if (isCancellationError) {
        return;
      }
      
      // Let other errors through
      originalError(...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // If there's an initialization error, show error UI
  if (initError && process.env.NODE_ENV === 'development') {
    console.warn('App initialization warning:', initError);
  }

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0F0F14" />
      </head>
      <body>
        <ErrorBoundary>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
