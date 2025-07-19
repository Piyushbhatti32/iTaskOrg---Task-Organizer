'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

// Enhanced Input Component
function InputField({
  label,
  type = "text",
  value,
  onChange,
  required = false,
  icon: Icon,
  placeholder,
  error,
  showPasswordToggle = false,
  onTogglePassword
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-10' : 'pr-4'} py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {type === 'password' ? (
              <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

// Enhanced Login Form
function LoginForm({ onSubmit, isLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(email, password, rememberMe);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrors({ email: "Please enter your email first" });
      return;
    }
    onSubmit(email, null, false, true);
  };

  return (
    <div className="space-y-6">
      <InputField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        placeholder="Enter your email"
        error={errors.email}
        required
      />

      <InputField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        placeholder="Enter your password"
        error={errors.password}
        showPasswordToggle
        onTogglePassword={() => setShowPassword(!showPassword)}
        required
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Remember me</span>
        </label>

        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Signing in...
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}

// Enhanced Google Login Button
function GoogleLoginButton({ onGoogleSignIn, isLoading }) {
  return (
    <button
      onClick={onGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {isLoading ? (
        <>
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Signing in with Google...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </>
      )}
    </button>
  );
}

// Enhanced Registration Form
function RegisterForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData.email, formData.password, formData.name);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength: (strength / 5) * 100, label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { strength: (strength / 5) * 100, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength: (strength / 5) * 100, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="space-y-6">
      <InputField
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(e) => updateFormData("name", e.target.value)}
        icon={User}
        placeholder="Enter your full name"
        error={errors.name}
        required
      />

      <InputField
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(e) => updateFormData("email", e.target.value)}
        icon={Mail}
        placeholder="Enter your email"
        error={errors.email}
        required
      />

      <div className="space-y-2">
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
          icon={Lock}
          placeholder="Create a strong password"
          error={errors.password}
          showPasswordToggle
          onTogglePassword={() => setShowPassword(!showPassword)}
          required
        />

        {formData.password && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Password strength:</span>
              <span className={`font-medium ${passwordStrength.label === 'Weak' ? 'text-red-600' :
                  passwordStrength.label === 'Fair' ? 'text-yellow-600' :
                    passwordStrength.label === 'Good' ? 'text-blue-600' :
                      'text-green-600'
                }`}>
                {passwordStrength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: `${passwordStrength.strength}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <InputField
        label="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={(e) => updateFormData("confirmPassword", e.target.value)}
        icon={Lock}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        showPasswordToggle
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        required
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <Sparkles className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}

// Success Message Component
function SuccessMessage({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Enhanced Login Page
export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirectAttempts, setRedirectAttempts] = useState(0);

  const {
    user,
    login,
    signUp,
    googleSignIn,
    resetPassword,
    error,
    loading,
    clearError,
    isRedirectResultChecked,
  } = useAuth();

  const router = useRouter();

  // Handle redirection
  const handleRedirect = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const redirectTo = from || '/tasks';
    
    console.log('Attempting redirect to:', redirectTo);
    
    // Force navigation to tasks if we've tried normal redirect multiple times
    if (redirectAttempts >= 2) {
      console.log('Force navigating to:', redirectTo);
      window.location.href = redirectTo;
      return;
    }

    router.replace(redirectTo);
    setRedirectAttempts(prev => prev + 1);
  }, [router, redirectAttempts]);

  useEffect(() => {
    // Debug logging
    console.log('Login page effect:', {
      user,
      redirecting,
      loading,
      isRedirectResultChecked,
      redirectAttempts,
      error
    });

    // Only redirect if we have a user, we're not already redirecting, and we've checked redirect results
    if (user && !redirecting && !loading && isRedirectResultChecked) {
      console.log('Starting redirect process');
      setRedirecting(true);
      handleRedirect();
    }
  }, [user, redirecting, loading, isRedirectResultChecked, handleRedirect, error]);

  // Reset redirect attempts when component unmounts
  useEffect(() => {
    return () => {
      setRedirectAttempts(0);
      setRedirecting(false);
    };
  }, []);

  const handleLogin = async (email, password, remember, isReset = false) => {
    if (redirecting) return; // Prevent multiple login attempts while redirecting
    clearError();
    try {
      if (isReset) {
        await resetPassword(email);
        setSuccessMessage("Password reset email sent! Please check your inbox.");
        setShowSuccess(true);
        return;
      }
      console.log('Attempting login...');
      await login(email, password, remember);
      console.log('Login successful');
      // Don't redirect here - let the useEffect handle it
    } catch (error) {
      console.error("Login failed:", error);
      setRedirecting(false); // Reset redirecting state on error
    }
  };

  const handleRegister = async (email, password, name) => {
    if (redirecting) return; // Prevent registration while redirecting
    clearError();
    try {
      await signUp(email, password, name);
      setSuccessMessage("Account created successfully! Please verify your email before logging in.");
      setShowSuccess(true);
    } catch (error) {
      console.error("Registration failed:", error);
      setRedirecting(false); // Reset redirecting state on error
    }
  };

  const handleGoogleSignIn = async () => {
    if (redirecting || googleLoading) return; // Prevent multiple attempts
    clearError();
    setGoogleLoading(true);
    try {
      console.log('Attempting Google sign in...');
      await googleSignIn();
      console.log('Google sign in initiated');
    } catch (error) {
      console.error("Google sign in failed:", error);
      setRedirecting(false);
      setRedirectAttempts(0);
      // Show error message to user
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    if (mode === "register") {
      setMode("login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Image
            src="/icon.svg"
            alt="App Icon"
            width={64}
            height={64}
            className="w-16 h-16 hover:scale-110 transition-transform"
            style={{ filter: 'invert(1)' }}
          />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">iTaskOrg</span>
          </h1>
          <p className="text-gray-600">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-8">
          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === "register"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Register
            </button>
          </div>

          {/* Forms */}
          {mode === "login" ? (
            <>
              <LoginForm onSubmit={handleLogin} isLoading={loading} />

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <GoogleLoginButton
                    onGoogleSignIn={handleGoogleSignIn}
                    isLoading={googleLoading}
                  />
                </div>
              </div>
            </>
          ) : (
            <RegisterForm onSubmit={handleRegister} isLoading={loading} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <SuccessMessage
          message={successMessage}
          onClose={handleSuccessClose}
        />
      )}
    </div>
  );
}