import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { Book, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'verify'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.signup(email, password, { full_name: fullName });
      setMode('verify');
      toast.success('Account created! Check your email to verify.');
    } catch (error) {
      toast.error(error?.message || 'Signup failed');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.login(email, password);
      window.location.href = '/home';
    } catch (error) {
      toast.error(error?.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resendVerificationEmail(email);
      toast.success('Verification email sent');
    } catch (error) {
      toast.error(error?.message || 'Failed to resend');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <Book className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bible Built</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Track your Bible reading journey</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'verify' && 'Verify Your Email'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Sign in to continue your reading'}
              {mode === 'signup' && 'Start tracking your Bible reading today'}
              {mode === 'verify' && 'Check your inbox for the verification link'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'verify' ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center py-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    We've sent a verification email to:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white mb-4">{email}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click the link in the email to verify your account, then return here to log in.
                  </p>
                </div>
                <Button
                  onClick={handleResendVerification}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </Button>
                <Button
                  onClick={() => setMode('login')}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="text-sm text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}