'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmail() {
  const { user, loading, reloadUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [manualVerifying, setManualVerifying] = useState(false);
  const [checking, setChecking] = useState(false);
  const redirectPath = searchParams.get('from') || '/tasks';
  
  // Check if this is an admin account
  const adminEmails = ['itaskorg+admin@gmail.com', 'itaskorg+support@gmail.com'];
  const isAdminAccount = user?.email && adminEmails.includes(user.email.toLowerCase());

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

      console.log('Attempting to send email verification to:', user.email);
      await sendEmailVerification(user);
      console.log('Email verification sent successfully');
      
      // Show success message or handle UI feedback
    } catch (error) {
      console.error('Firebase sendEmailVerification error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Provide more specific error messages based on Firebase error codes
      let errorMessage = 'Failed to resend verification email. Please try again later.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log in again to resend the verification email.';
      } else if (error.code === 'auth/invalid-api-key') {
        errorMessage = 'Configuration error. Please contact support.';
      }
      
      setError(errorMessage);
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  const handleRefresh = async () => {
    try {
      setChecking(true);
      setError('');
      
      // Reload the user using the context method to ensure state is updated
      await reloadUser();
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        // Check if the email is verified and redirect
        if (user?.emailVerified || isAdminAccount) {
          document.cookie = 'email-verified=true; path=/; max-age=31536000; SameSite=Lax';
          router.push(redirectPath);
        } else {
          setError('Email is not yet verified. Please check your email and click the verification link.');
        }
        setChecking(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error checking email verification:', error);
      setError('Failed to check email verification status. Please try again.');
      setChecking(false);
    }
  };

  const handleManualVerification = async () => {
    if (!isAdminAccount) return;
    
    try {
      setManualVerifying(true);
      setError('');
      
      const response = await fetch('/api/admin/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          uid: user.uid
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Set the verification cookie and redirect
        document.cookie = 'email-verified=true; path=/; max-age=31536000; SameSite=Lax';
        router.push(redirectPath);
      } else {
        setError(result.error || 'Failed to verify account');
      }
    } catch (error) {
      setError('Failed to verify admin account. Please try again.');
      console.error('Manual verification error:', error);
    } finally {
      setManualVerifying(false);
    }
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

            {!isAdminAccount && (
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
            )}
            
            {isAdminAccount && (
              <button
                onClick={handleManualVerification}
                disabled={manualVerifying}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium transition-all duration-300 ${
                  manualVerifying
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {manualVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Verifying Admin Account...
                  </>
                ) : (
                  'Verify Admin Account'
                )}
              </button>
            )}
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