import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Trophy, BarChart3 } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, path: '/Home' },
    { name: 'Achievements', icon: Trophy, path: '/Achievements' },
    { name: 'Stats', icon: BarChart3, path: '/Stats' },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || 
              (item.path === '/Home' && currentPath === '/');
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`
                  flex flex-col items-center justify-center px-6 py-2 rounded-xl transition-all
                  ${isActive 
                    ? 'text-black dark:text-white' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                  }
                `}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      </div>
    </ThemeProvider>
  );
}