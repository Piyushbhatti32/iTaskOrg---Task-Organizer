'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store';
import Image from 'next/image';

// Login form component
function LoginForm({ onSubmit, isLoading }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-sm">Remember me</span>
        </label>
        <a href="#" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}

// Social login buttons component
function SocialLogin({ onSocialLogin, isLoading }) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => onSocialLogin('google')}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded hover:bg-gray-50"
      >
        <img
          src="/google-icon.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>
      <button
        onClick={() => onSocialLogin('github')}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded hover:bg-gray-800"
      >
        <img
          src="/github-icon.svg"
          alt="GitHub"
          className="w-5 h-5"
        />
        Continue with GitHub
      </button>
    </div>
  );
}

// Registration form component
function RegisterForm({ onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onSubmit({ name, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}

// Main Login page component
export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const router = useRouter();
  const login = useStore(state => state.login);

  const handleLogin = async (credentials) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      login(credentials);
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setIsLoading(true);
    try {
      // Mock registration - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Automatically log in after registration
      login(userData);
      router.push('/');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      // Mock social login - replace with actual OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1000));
      login({ provider });
      router.push('/');
    } catch (error) {
      console.error('Social login failed:', error);
      alert('Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to iTaskOrg</h1>
          <p className="mt-2 text-gray-600">
            {mode === 'login'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2 rounded ${
                mode === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-4 py-2 rounded ${
                mode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
              />
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <SocialLogin
                    onSocialLogin={handleSocialLogin}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              isLoading={isLoading}
            />
          )}
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
} 