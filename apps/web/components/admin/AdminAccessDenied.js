import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function AdminAccessDenied({ 
  title = "Admin Access Required",
  message = "Only administrators can access this panel/section",
  redirectPath = "/tasks",
  redirectLabel = "Go to Dashboard",
  showHelpDeskOption = true 
}) {
  const { isDark } = useTheme();
  const router = useRouter();

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full">
        <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} rounded-2xl p-8 shadow-lg border text-center`}>
          {/* Error Icon */}
          <div className="mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'bg-red-900/20' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
              <Shield className={`w-10 h-10 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            
            {/* Title */}
            <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
              {title}
            </h1>
            
            {/* Main Message */}
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
              {message}
            </p>
            
            {/* Additional Context */}
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              If you believe you should have access to this area, please contact your system administrator.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Action */}
            <button
              onClick={() => router.push(redirectPath)}
              className={`w-full flex items-center justify-center gap-2 ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-3 rounded-lg font-medium transition-colors`}
            >
              <Home className="w-4 h-4" />
              {redirectLabel}
            </button>

            {/* Help Desk Option */}
            {showHelpDeskOption && (
              <button
                onClick={() => router.push('/help-desk')}
                className={`w-full flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} px-4 py-3 rounded-lg font-medium transition-colors`}
              >
                <HelpCircle className="w-4 h-4" />
                Need Help?
              </button>
            )}

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className={`w-full flex items-center justify-center gap-2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} px-4 py-2 transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Footer Info */}
          <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Access Level: Regular User
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
