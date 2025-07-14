'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const redirectPath = searchParams.get('from') || '/tasks';

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // If email is already verified, redirect to tasks
    if (!loading && user?.emailVerified) {
      document.cookie = 'email-verified=true; path=/; max-age=31536000; SameSite=Lax';
      router.push(redirectPath);
    }
  }, [user, loading, router, redirectPath]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    try {
      setError('');
      setResendDisabled(true);
      setCountdown(60); // 60 seconds cooldown

      await user.sendEmailVerification();
      
      // Show success message or handle UI feedback
    } catch (error) {
      setError('Failed to resend verification email. Please try again later.');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  const handleRefresh = () => {
    // Reload the user to check verification status
    user.reload().then(() => {
      if (user.emailVerified) {
        document.cookie = 'email-verified=true; path=/; max-age=31536000; SameSite=Lax';
        router.push(redirectPath);
      }
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-6">
          <div className="animate-pulse flex justify-center">
            <div className="h-8 w-8 bg-blue-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <div className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a verification email to:
              <br />
              <span className="font-medium text-gray-900">{user.email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              I've Verified My Email
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendDisabled}
              className={`w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                resendDisabled
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {resendDisabled
                ? `Resend Email (${countdown}s)`
                : 'Resend Verification Email'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => router.push('/profile')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                update your email address
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 