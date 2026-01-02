import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import { useGuestMode } from '@/components/GuestModeProvider';
import { base44 } from '@/api/base44Client';
import { useGuestSafeUser } from '@/components/useGuestSafeQuery';

export default function Settings() {
  const { isGuest } = useGuestMode();
  const { data: user } = useGuestSafeUser();

  const handleSignIn = () => {
    base44.auth.redirectToLogin(window.location.origin + createPageUrl('Home'));
  };

  const handleSignOut = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-950 dark:to-slate-900">
      <ThemeToggle />
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
              <p className="text-sm text-gray-600 dark:text-slate-400">Manage your account</p>
            </div>
          </div>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Account</h2>
          
          {isGuest ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100">Guest Mode</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Your progress is saved locally
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In / Create Account
              </Button>
              
              <p className="text-xs text-center text-gray-500 dark:text-slate-500">
                Sign in to sync your progress across devices
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-slate-700/20">
                <User className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-slate-100">{user?.full_name}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{user?.email}</p>
                </div>
              </div>
              
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          )}
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 shadow-lg border border-gray-200 dark:border-slate-700/50"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">About</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Version 1.0.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}