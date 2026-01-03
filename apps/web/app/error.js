'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h1 className="text-xl font-bold text-red-900 dark:text-red-100">
            Page Error
          </h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Something went wrong on this page. Please try again or return home.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-700">
            <p className="text-sm font-mono text-red-800 dark:text-red-200 wrap-break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-medium py-2 px-4 rounded transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
