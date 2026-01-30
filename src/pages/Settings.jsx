import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { useTheme } from '@/components/ThemeProvider';
import { LogOut, Mail, Palette, Monitor, Sun, Moon, Zap, User, Pencil, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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
      <div className="max-w-2xl mx-auto px-5">
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

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Permanently delete your account and all data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                variant="outline" 
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription className="pt-2">
              This permanently deletes your account and all your Bible Built data (reading logs, plans, badges, stats). This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Type <span className="font-bold text-foreground">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="text-center"
              disabled={isDeleting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmText('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}