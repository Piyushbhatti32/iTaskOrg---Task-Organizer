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
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6">
        <div className="bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl p-8 space-y-6 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We&apos;ve sent a verification email to:
              <br />
              <span className="font-medium text-gray-900">{user.email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              I&apos;ve Verified My Email
            </button>

            <button
              onClick={handleResendEmail}
              disabled={resendDisabled}
              className={`w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
                resendDisabled
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {resendDisabled
                ? `Resend Email (${countdown}s)`
                : 'Resend Verification Email'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => router.push('/profile')}
                className="text-blue-600 hover:text-purple-600 font-medium transition-colors duration-200"
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