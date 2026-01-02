'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Placeholder for error logging service (e.g., Sentry, LogRocket)
    console.error('Would log to error service:', {
      message: error.toString(),
      stack: errorInfo.componentStack,
    });
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
                Oops! Something went wrong
              </h1>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              An unexpected error occurred. Our team has been notified.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
                <p className="text-sm font-mono text-red-800 dark:text-red-200 wrap-break-words">
                  {this.state.error?.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2 cursor-pointer">
                    <summary className="text-sm text-red-700 dark:text-red-300 hover:underline">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto bg-red-100 dark:bg-red-900/50 p-2 rounded text-red-900 dark:text-red-100">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.resetError}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium py-2 px-4 rounded transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>

            {this.state.errorCount > 3 && (
              <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Multiple errors detected. Please contact support if the problem persists.
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
