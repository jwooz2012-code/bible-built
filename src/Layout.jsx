import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Calendar, BarChart3, User, Users, Zap } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import CelebrationRenderer from '@/components/celebration/CelebrationRenderer';

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home',     icon: Home,      path: '/home',     color: 'text-zinc-900 dark:text-zinc-100', dot: 'bg-zinc-900 dark:bg-zinc-100' },
    { name: 'Calendar', icon: Calendar,  path: '/calendar', color: 'text-red-500',                     dot: 'bg-red-500'     },
    { name: 'Friends',  icon: Users,     path: '/social',   color: 'text-blue-500',                    dot: 'bg-blue-500'    },
    { name: 'Treasury', icon: Zap,       path: '/treasury', color: 'text-amber-500',                   dot: 'bg-amber-500'   },
    { name: 'Stats',    icon: BarChart3, path: '/stats',    color: 'text-green-500',                   dot: 'bg-green-500'   },
    { name: 'Profile',  icon: User,      path: '/profile',  color: 'text-purple-500',                  dot: 'bg-purple-500'  },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 56px)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-[60]"
        style={{
          paddingBottom: 'var(--sab)',
          paddingLeft: 'var(--sal)',
          paddingRight: 'var(--sar)',
        }}
      >
        <div className="max-w-lg mx-auto flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const isActive =
              currentPath === item.path ||
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
                className="flex flex-col items-center justify-center gap-1 relative px-1 min-w-[44px] min-h-[44px]"
              >
                <item.icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive ? `${item.color} stroke-[2.2]` : `${item.color} opacity-40 stroke-[1.5]`
                  }`}
                />
                <span
                  className={`text-[9px] leading-none transition-all duration-200 ${
                    isActive ? `${item.color} font-bold` : `${item.color} opacity-40 font-medium`
                  }`}
                >
                  {item.name}
                </span>

                {/* Colored indicator bar at top of nav */}
                {isActive && (
                  <div className={`absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${item.dot}`} />
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
          style: { pointerEvents: 'auto' },
        }}
        style={{ zIndex: 9999 }}
      />
    </ThemeProvider>
  );
}
