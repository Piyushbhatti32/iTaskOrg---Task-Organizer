'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';

const navLinks = [
  { href: '/', label: 'Tasks', icon: '📝' },
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

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md">
              <div className="p-4">
                <h1 className="text-2xl font-bold text-blue-600">iTaskOrg</h1>
              </div>
              <nav className="mt-4">
                <ul className="space-y-2">
                  {navLinks.map(({ href, label, icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                          pathname === href ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <span className="mr-3">{icon}</span>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
