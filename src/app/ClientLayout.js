'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import TaskLoader from '../components/TaskLoader';
import { useProfile } from '../store';
import { LogOut, User, Menu, X, Shield } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { isAdmin } from '../utils/roles';

const navLinks = [
  { href: '/tasks', label: 'Tasks', icon: '📝' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/focus', label: 'Focus', icon: '⏱️' },
  { href: '/templates', label: 'Templates', icon: '📋' },
  { href: '/groups', label: 'Groups', icon: '👥' },
  { href: '/team', label: 'Team', icon: '🤝' },
  { href: '/stats', label: 'Statistics', icon: '📊' },
  { href: '/completed', label: 'Completed', icon: '✅' },
  { href: '/help-desk', label: 'Help Desk', icon: '🎫' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

// User profile section component
function UserProfile({ user }) {
  const { isDark } = useTheme();
  const profile = useProfile();
  
  const displayName = profile.name || user.displayName || 'User';
  const avatarContent = useMemo(() => {
    if (!user) return <User className="w-5 h-5" />;
    if (profile.avatar) {
      return (
        <Image 
          src={profile.avatar} 
          alt={displayName} 
          width={40}
          height={40}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = displayName.charAt(0) || '<User className="w-5 h-5" />';
          }}
        />
      );
    }
    if (user.photoURL) {
      return (
        <Image 
          src={user.photoURL} 
          alt={displayName} 
          width={40}
          height={40}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = displayName.charAt(0) || '<User className="w-5 h-5" />';
          }}
        />
      );
    }
    return displayName.charAt(0) || <User className="w-5 h-5" />;
  }, [user, profile.avatar, displayName]);

  if (!user) return null;

  return (
    <Link 
      href="/profile"
      className={`p-4 border-b ${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-50'} flex items-center gap-3 transition-colors`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white overflow-hidden">
        {avatarContent}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
          {displayName}
        </div>
        <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`}>
          {user.email}
        </div>
      </div>
    </Link>
  );
}

// Navigation links component
function NavigationLinks({ pathname, user }) {
  const { isDark } = useTheme();
  const userIsAdmin = isAdmin(user);
  
  const adminLinks = [
    { href: '/admin/help-desk', label: 'Admin Help Desk', icon: '🛠️' },
  ];
  
  return (
    <div className="p-4 space-y-4">
      {/* Regular Navigation */}
      <ul className="space-y-0.5">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`flex items-center space-x-2 p-3 rounded-xl transition-colors ${
                pathname === link.href 
                  ? `${isDark ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'} font-medium` 
                  : `${isDark ? 'text-gray-200 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'}`
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Admin Section */}
      {userIsAdmin && (
        <div>
          <div className={`flex items-center gap-2 px-3 py-2 mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Admin</span>
          </div>
          <ul className="space-y-0.5">
            {adminLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-2 p-3 rounded-xl transition-colors ${
                    pathname === link.href 
                      ? `${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'} font-medium` 
                      : `${isDark ? 'text-gray-200 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'}`
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Mobile Header component
function MobileHeader({ onMenuClick, user }) {
  const { isDark } = useTheme();
  const pathname = usePathname();
  
  const currentPage = navLinks.find(link => link.href === pathname);
  
  if (!user || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <header className={`lg:hidden fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-gray-950/95 border-gray-800' : 'bg-white/95 border-gray-200'} backdrop-blur-sm border-b shadow-sm`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentPage?.icon || '📱'}</span>
            <h1 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {currentPage?.label || 'iTaskOrg'}
            </h1>
          </div>
        </div>
        
        <Link href="/profile" className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white overflow-hidden">
          {user.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || 'Profile'} 
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {user.displayName?.charAt(0) || <User className="w-4 h-4" />}
            </span>
          )}
        </div>
        </Link>
      </div>
    </header>
  );
}

// Mobile Navigation Overlay
function MobileNavOverlay({ isOpen, onClose, user }) {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { logout } = useAuth();
  const profile = useProfile();
  const router = useRouter();
  
  const displayName = profile.name || user.displayName || 'User';
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleLinkClick = () => {
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <nav className={`lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} border-r shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">iTaskOrg</h1>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl ${isDark ? 'hover:bg-gray-800 text-gray-200' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* User Profile */}
        <Link 
          href="/profile"
          onClick={handleLinkClick}
          className={`p-4 border-b ${isDark ? 'border-gray-800 hover:bg-gray-900' : 'border-gray-200 hover:bg-gray-50'} flex items-center gap-3 transition-colors`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white overflow-hidden">
            {profile.avatar ? (
              <Image 
                src={profile.avatar} 
                alt={displayName} 
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : user.photoURL ? (
              <Image 
                src={user.photoURL} 
                alt={displayName} 
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0) || <User className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'} truncate`}>
              {displayName}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'} truncate`}>
              {user.email}
            </div>
          </div>
        </Link>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto" onClick={handleLinkClick}>
          <NavigationLinks pathname={pathname} user={user} />
        </div>
        
        {/* Logout Button */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 p-3 w-full rounded-xl ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} transition-colors`}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

// Desktop Navigation Sidebar
function DesktopNavigationSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
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
    <nav className={`hidden lg:flex w-64 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'} border-r shadow-sm fixed h-screen overflow-y-auto flex-col scrollbar-hide z-30`}>
      <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">iTaskOrg</h1>
      </div>
      
      <UserProfile user={user} />

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <NavigationLinks pathname={pathname} user={user} />
      </div>
      
      <div className={`p-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} mt-auto`}>
        <button
          onClick={handleLogout}
          className={`flex items-center space-x-2 p-3 w-full rounded-xl ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'} transition-colors`}
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
  const { loading, user } = useAuth();
  const { isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on window resize to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading...</p>
        </div>
      </div>
    );
  }

  const showNavigation = user && !pathname.startsWith('/login');

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Mobile Header */}
      {showNavigation && (
        <MobileHeader 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          user={user} 
        />
      )}
      
      {/* Desktop Sidebar */}
      {showNavigation && <DesktopNavigationSidebar />}
      
      {/* Mobile Navigation Overlay */}
      {showNavigation && (
        <MobileNavOverlay 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
          user={user} 
        />
      )}
      
      {/* Main Content */}
      <main className={`min-h-screen ${
        showNavigation 
          ? 'lg:ml-64 pt-16 lg:pt-0' // Mobile: add top padding for header, Desktop: add left margin
          : ''
      }`}>
        {children}
      </main>
    </div>
  );
}

// Client layout with auth provider
export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskLoader>
          <AppLayout>
            {children}
          </AppLayout>
        </TaskLoader>
      </ThemeProvider>
    </AuthProvider>
  );
}
