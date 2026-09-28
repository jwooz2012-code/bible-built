import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

function AppleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.72 3.01.76.96-.17 1.87-.84 3.06-.89 1.47-.07 2.74.59 3.52 1.69-3.2 1.87-2.56 5.96.61 7.37-.62 1.66-1.4 3.31-2.2 3.95zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

// The same Google + Apple choices on Log in and Create account. Both come
// back to wherever the user was headed (e.g. a group invite link).
export default function SocialSignInButtons() {
  const signIn = (provider) => base44.auth.loginWithProvider(provider, safeReturnTo());

  return (
    <>
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-3"
        onClick={() => signIn("google")}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={() => signIn("apple")}
      >
        <AppleIcon className="w-5 h-5 mr-2" />
        Continue with Apple
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>
    </>
  );
}
