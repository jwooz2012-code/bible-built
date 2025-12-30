import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Trophy, BarChart3 } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, path: '/Home' },
    { name: 'Achievements', icon: Trophy, path: '/Achievements' },
    { name: 'Stats', icon: BarChart3, path: '/Stats' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {children}
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 safe-area-inset-bottom z-50">
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
                    ? 'text-amber-600' 
                    : 'text-stone-400 hover:text-stone-600'
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
  );
}