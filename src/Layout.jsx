import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Home, Calendar, BarChart3, User, Users, Landmark, Lock } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';

import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import CelebrationRenderer from '@/components/celebration/CelebrationRenderer';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user } = useAuth();

  useEffect(() => {
    // Root-only landing fix. Do not affect deep links.
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, currentPath]);

  const hasAccess = user?.role === 'admin' || user?.hasEarlyAccess;

  const navItems = [
    { name: 'Home', icon: Home, path: '/home', pageName: 'home', color: 'text-foreground' },
    { name: 'Calendar', icon: Calendar, path: '/calendar', pageName: 'calendar', color: 'text-rose-500' },
    { name: 'Friends', icon: Users, path: '/social', pageName: 'social', locked: !hasAccess, color: 'text-blue-500' },
    ...(hasAccess ? [{ name: 'Treasury', icon: Landmark, path: '/treasury', pageName: 'treasury', color: 'text-amber-500' }] : []),
    { name: 'Progress', icon: BarChart3, path: '/Stats', pageName: 'Stats', color: 'text-emerald-500' },
    { name: 'Profile', icon: User, path: '/profile', pageName: 'profile', color: 'text-violet-500' },
  ];

  // Ensure Accountability page is accessible via direct navigation
  // (not in bottom nav, but available as a page)



  return (
    <ThemeProvider>
      <div className="app-safe-shell">
        {children}
      </div>

      <nav className="app-bottom-nav fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-[60]">
          <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-6">
              {navItems.map((item) => {
                const isActive = currentPath === item.path || 
                  (item.path === '/home' && (currentPath === '/' || currentPath === '/home'));
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.path === '/home') {
                        window.dispatchEvent(new Event('biblebuilt:homeTap'));
                        if (currentPath !== '/home') {
                          navigate('/home', { replace: true });
                        }
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className="flex flex-col items-center justify-center gap-1 transition-all relative"
                  >
                    <div className="relative w-6 h-6">
                     <item.icon 
                       className={`w-6 h-6 stroke-[2] transition-all duration-200 ${item.color || 'text-muted-foreground'} ${isActive ? 'scale-110' : 'scale-100 opacity-50'}`}
                     />
                     {item.locked && (
                       <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-black border border-white flex items-center justify-center">
                         <Lock className="w-1.5 h-1.5 text-white" />
                       </div>
                     )}
                    </div>
                    <span 
                     className={`text-[10px] flex items-center gap-0.5 transition-all duration-200 ${item.color || 'text-muted-foreground'} ${isActive ? 'font-semibold' : 'font-medium opacity-50'}`}
                    >
                     {item.name}
                    </span>
                    {isActive && (
                     <div 
                       className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full ${item.color?.replace('text-', 'bg-') || 'bg-border'}`}
                     />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
          <CelebrationRenderer />
          <Toaster
          position="bottom-center"
          expand={false}
          closeButton={false}
          toastOptions={{
          duration: 1600,
          style: {
          pointerEvents: 'auto'
          }
          }}
          style={{
          zIndex: 9999
          }}
          />
          </ThemeProvider>
          );
          }