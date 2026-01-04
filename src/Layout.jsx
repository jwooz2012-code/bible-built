import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
    { name: 'Stats', icon: BarChart3, path: '/stats' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];



  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        {children}

        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-50">
            <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-6">
              {navItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path === '/home' && currentPath === '/');
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`
                      flex flex-col items-center justify-center gap-1 transition-all
                      ${isActive 
                        ? 'text-accent' 
                        : 'text-muted-foreground'
                      }
                    `}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2]' : 'stroke-[1.5]'}`} />
                    <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
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