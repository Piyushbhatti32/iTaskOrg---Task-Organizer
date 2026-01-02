import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">
            404 - Page Not Found
          </h1>
        </div>

        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="block text-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
