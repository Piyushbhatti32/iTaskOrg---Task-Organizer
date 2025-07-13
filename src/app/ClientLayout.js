'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useMemo } from 'react';

const navLinks = [
  { href: '/tasks', label: 'Tasks', icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/focus', label: 'Focus', icon: '⏱️' },
  { href: '/templates', label: 'Templates', icon: '📋' },
  { href: '/groups', label: 'Groups', icon: '👥' },
  { href: '/team', label: 'Team', icon: '🤝' },
  { href: '/stats', label: 'Statistics', icon: '📊' },
  { href: '/completed', label: 'Completed', icon: '✅' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

// User profile section component
function UserProfile({ user }) {
  const avatarContent = useMemo(() => {
    if (!user) return <User className="w-5 h-5" />;
    if (user.photoURL) {
      return (
        <img 
          src={user.photoURL} 
          alt={user.displayName || 'Profile'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = user.displayName?.charAt(0) || '<User className="w-5 h-5" />';
          }}
        />
      );
    }
    return user.displayName?.charAt(0) || <User className="w-5 h-5" />;
  }, [user]);

  if (!user) return null;

  return (
    <Link 
      href="/profile"
      className="p-4 border-b border-gray-200 flex items-center gap-3 hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white overflow-hidden">
        {avatarContent}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {user.displayName || 'User'}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {user.email}
        </div>
      </div>
    </Link>
  );
}

// Navigation links component
function NavigationLinks({ pathname }) {
  return (
    <ul className="space-y-1 p-4">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className={`flex items-center space-x-2 p-3 rounded-xl hover:bg-gray-100 transition-colors ${
              pathname === link.href ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

// Separate component for the navigation sidebar
function NavigationSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <nav className="w-64 bg-white border-r border-gray-200 shadow-sm fixed h-screen overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">iTaskOrg</h1>
      </div>
      
      <UserProfile user={user} />

      <div className="flex-1 overflow-y-auto">
        <NavigationLinks pathname={pathname} />
      </div>
      
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 p-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

// Main layout component
function AppLayout({ children }) {
  const pathname = usePathname();
  const { loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <NavigationSidebar />
      <main className={`flex-1 ${!pathname.startsWith('/login') ? 'ml-64' : ''} min-h-screen`}>
        {children}
      </main>
    </div>
  );
}

// Client layout with auth provider
export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthProvider>
  );
} 