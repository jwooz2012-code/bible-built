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
    // Root-only landing fix. Do not affect deep links.
    if (location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Each item carries its own active color + background pill + indicator dot
  const navItems = [
    { name: 'Home',     icon: Home,     path: '/home',     color: 'text-sky-500',     bg: 'bg-sky-500/10',     dot: 'bg-sky-500'     },
    { name: 'Calendar', icon: Calendar, path: '/calendar', color: 'text-emerald-500', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
    { name: 'Friends',  icon: Users,    path: '/social',   color: 'text-violet-500',  bg: 'bg-violet-500/10',  dot: 'bg-violet-500'  },
    { name: 'Treasury', icon: Zap,      path: '/treasury', color: 'text-amber-500',   bg: 'bg-amber-500/10',   dot: 'bg-amber-500'   },
    { name: 'Stats',    icon: BarChart3, path: '/stats',   color: 'text-orange-500',  bg: 'bg-orange-500/10',  dot: 'bg-orange-500'  },
    { name: 'Profile',  icon: User,     path: '/profile',  color: 'text-rose-500',    bg: 'bg-rose-500/10',    dot: 'bg-rose-500'    },
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
                className="flex flex-col items-center justify-center gap-0.5 relative px-1 min-w-[44px] min-h-[44px]"
              >
                {/* Colored pill behind icon when active */}
                <div
                  className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                    isActive ? item.bg : 'bg-transparent'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-all duration-200 ${
                      isActive ? `${item.color} stroke-[2.2]` : 'text-muted-foreground/60 stroke-[1.6]'
                    }`}
                  />
                </div>

                <span
                  className={`text-[9px] leading-none transition-all duration-200 ${
                    isActive ? `${item.color} font-bold` : 'text-muted-foreground/60 font-medium'
                  }`}
                >
                  {item.name}
                </span>

                {/* Colored indicator dot */}
                {isActive && (
                  <div
                    className={`absolute -top-px left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${item.dot}`}
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
          style: { pointerEvents: 'auto' },
        }}
        style={{ zIndex: 9999 }}
      />
    </ThemeProvider>
  );
}
