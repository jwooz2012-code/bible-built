import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Loader2, CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialSignInButtons from "@/components/auth/SocialSignInButtons";
import { safeReturnTo, withReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const [searchParams] = useSearchParams();
  const justReset = searchParams.get("reset") === "done";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={BookOpen}
      title="Welcome to Bible Built"
      subtitle="Log in or create an account to start reading"
      footer={
        <>
          <span className="block mb-3">New here?</span>
          <Link
            to={withReturnTo("/register")}
            className="flex w-full h-12 items-center justify-center rounded-md border border-border bg-card text-sm font-medium text-foreground shadow-sm hover:bg-accent"
          >
            Create an account
          </Link>
        </>
      }
    >
      {justReset && !error && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 text-foreground text-sm flex items-start gap-2" role="status">
          <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
          <span>Password updated. Log in with your new password.</span>
        </div>
      )}

      <SocialSignInButtons />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
          <span className="block mt-1 text-muted-foreground">
            Signed up with Google or Apple? Use those buttons above.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
