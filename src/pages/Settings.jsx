import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useTheme } from '@/components/ThemeProvider';
import { LogOut, Mail, Palette, Monitor, Sun, Moon, Zap, User, Pencil } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme, energyMode, setEnergyMode, energyPalette, setEnergyPalette } = useTheme();

  useEffect(() => {
    let mounted = true;
    base44.auth.me()
      .then(u => { 
        if (mounted) { 
          setUser(u); 
          setDisplayName(u.displayName || '');
          setIsLoading(false); 
        } 
      })
      .catch(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      // Delete all user data
      await base44.entities.ReadingLog.delete({ userId: user.id });
      await base44.entities.ReadingPlan.delete({ userId: user.id });
      await base44.entities.PlanDay.delete({ userId: user.id });
      
      // Sign out and redirect
      toast.success('Account deleted');
      setTimeout(() => {
        base44.auth.logout();
      }, 1000);
    } catch (error) {
      toast.error('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await base44.auth.resendVerificationEmail(user.email);
      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error?.message || 'Failed to resend');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ displayName: displayName.trim() });
      setUser({ ...user, displayName: displayName.trim() });
      setIsEditingName(false);
      toast.success('Saved');
    } catch (error) {
      toast.error(error?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
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
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Your display name and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Display Name</p>
                {!isEditingName ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">
                      {user.displayName || user.email?.split('@')[0] || 'Friend'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingName(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={isSaving}
                        size="sm"
                        className="flex-1"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDisplayName(user.displayName || '');
                          setIsEditingName(false);
                        }}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Timezone</p>
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
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-secondary'
                  }`}
                >
                  <Monitor className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">System</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-secondary'
                  }`}
                >
                  <Sun className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-secondary'
                  }`}
                >
                  <Moon className="w-5 h-5 text-foreground" />
                  <span className="text-xs font-medium text-foreground">Dark</span>
                </button>
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Energy Mode</p>
                      <p className="text-xs text-muted-foreground">Arcade-style visuals</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{energyMode ? 'On' : 'Off'}</span>
                    <Switch 
                      checked={energyMode} 
                      onCheckedChange={setEnergyMode}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-border"
                    />
                  </div>
                </div>

                {energyMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground">Energy Palette</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setEnergyPalette('petal')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          energyPalette === 'petal'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="w-full h-2 rounded-full overflow-hidden">
                          <div className="h-full" style={{ 
                            background: 'linear-gradient(90deg, hsl(345 58% 68%), hsl(18 55% 78%), hsl(275 45% 82%), hsl(42 55% 84%))' 
                          }} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Petal</span>
                      </button>

                      <button
                        onClick={() => setEnergyPalette('surge')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          energyPalette === 'surge'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="w-full h-2 rounded-full overflow-hidden">
                          <div className="h-full" style={{ 
                            background: 'linear-gradient(90deg, hsl(140 100% 48%), hsl(210 100% 60%), hsl(24 100% 58%), hsl(285 100% 70%))' 
                          }} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Surge</span>
                      </button>

                      <button
                        onClick={() => setEnergyPalette('royal')}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          energyPalette === 'royal'
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-card'
                        }`}
                      >
                        <div className="w-full h-2 rounded-full overflow-hidden">
                          <div className="h-full" style={{ 
                            background: 'linear-gradient(90deg, hsl(220 90% 56%), hsl(220 80% 42%), hsl(0 0% 100%), hsl(220 25% 12%))' 
                          }} />
                        </div>
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-wide">Royal</span>
                      </button>
                    </div>
                  </motion.div>
                )}
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