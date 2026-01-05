import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useTheme } from '@/components/ThemeProvider';
import { LogOut, Mail, Palette, Monitor, Sun, Moon, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [energyMode, setEnergyMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { if (mounted) { setUser(u); setIsLoading(false); } })
      .catch(() => { if (mounted) setIsLoading(false); });
    
    // Load Energy Mode preference
    const saved = localStorage.getItem('bb_energy_mode') === '1';
    setEnergyMode(saved);
    
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleResendVerification = async () => {
    try {
      await base44.auth.resendVerificationEmail(user.email);
      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error?.message || 'Failed to resend');
    }
  };

  const toggleEnergyMode = (checked) => {
    setEnergyMode(checked);
    localStorage.setItem('bb_energy_mode', checked ? '1' : '0');
    const root = window.document.documentElement;
    if (checked) {
      root.classList.add('energy');
    } else {
      root.classList.remove('energy');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-20 w-64" />
      </div>
    );
  }

  if (!user) {
    base44.auth.redirectToLogin();
    return null;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto px-5 py-8">
        <PageHeader title="Settings" subtitle="Manage your account" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-5"
        >
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium text-foreground">{user.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Timezone</p>
                <p className="text-sm font-medium text-foreground">{timezone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>Choose your theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('system')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all bg-secondary"
                  style={theme === 'system' ? {
                    borderColor: 'hsl(var(--primary))',
                    background: 'hsl(var(--primary) / 0.1)'
                  } : { borderColor: 'hsl(var(--border))' }}
                >
                  <Monitor className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">System</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all bg-secondary"
                  style={theme === 'light' ? {
                    borderColor: 'hsl(var(--primary))',
                    background: 'hsl(var(--primary) / 0.1)'
                  } : { borderColor: 'hsl(var(--border))' }}
                >
                  <Sun className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all bg-secondary"
                  style={theme === 'dark' ? {
                    borderColor: 'hsl(var(--primary))',
                    background: 'hsl(var(--primary) / 0.1)'
                  } : { borderColor: 'hsl(var(--border))' }}
                >
                  <Moon className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Dark</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Energy Mode
              </CardTitle>
              <CardDescription>Vibrant colors and motion for a more dynamic experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Enable Energy Mode</span>
                <Switch checked={energyMode} onCheckedChange={toggleEnergyMode} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Resend verification email if needed</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleResendVerification} variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign Out</CardTitle>
              <CardDescription>Log out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}