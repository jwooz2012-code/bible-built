import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Trophy, BarChart3 } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', icon: Home, path: '/Home' },
    { name: 'Achievements', icon: Trophy, path: '/Achievements' },
    { name: 'Stats', icon: BarChart3, path: '/Stats' },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        {children}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 safe-area-inset-bottom z-50 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/50">
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
                    ? 'text-slate-900 dark:text-slate-50 scale-105' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:scale-105'
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