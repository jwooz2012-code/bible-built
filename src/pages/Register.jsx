import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialSignInButtons from "@/components/auth/SocialSignInButtons";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo, withReturnTo } from "@/lib/authReturnTo";

const RESEND_WAIT_SECONDS = 30;

// Registration errors don't carry a stable code, so match the wording.
const looksLikeExistingAccount = (message = "") => /already|exists|registered|in use/i.test(message);

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const verifying = useRef(false);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setOtpCode("");
      setShowOtp(true);
      setResendIn(RESEND_WAIT_SECONDS);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Runs on its own once all 6 digits are typed or pasted.
  const handleVerify = async (code = otpCode) => {
    if (verifying.current || code.length < 6) return;
    verifying.current = true;
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode: code });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
      setOtpCode("");
      verifying.current = false;
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    setError("");
    setResendIn(RESEND_WAIT_SECONDS);
    try {
      await base44.auth.resendOtp(email);
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setResendIn(0);
      setError(err.message || "Failed to resend code");
    }
  };

  const changeEmail = () => {
    setShowOtp(false);
    setOtpCode("");
    setError("");
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a 6-digit code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            onComplete={handleVerify}
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={() => handleVerify()}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{" "}
          {resendIn > 0 ? (
            <span>Resend in {resendIn}s</span>
          ) : (
            <button type="button" onClick={handleResend} className="text-primary font-medium hover:underline">
              Resend
            </button>
          )}
        </p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Wrong email?{" "}
          <button type="button" onClick={changeEmail} className="text-primary font-medium hover:underline">
            Change it
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link to={withReturnTo("/login")} className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SocialSignInButtons />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm" role="alert">
          {error}
          {looksLikeExistingAccount(error) && (
            <Link to={withReturnTo("/login")} className="block mt-1 text-primary font-medium hover:underline">
              Log in instead
            </Link>
          )}
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
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
