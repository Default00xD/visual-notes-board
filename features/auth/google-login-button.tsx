"use client";

import { useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/features/auth/google-icon";

export function GoogleLoginButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo
        }
      });
    });
  };

  return (
    <Button
      type="button"
      variant="default"
      size="lg"
      className="w-full gap-2 bg-white text-slate-900 hover:bg-slate-50 border border-slate-300"
      onClick={handleLogin}
      disabled={isPending}
    >
      <GoogleIcon className="h-4 w-4" />
      {isPending ? "Перенаправление в Google…" : "Войти через Google"}
    </Button>
  );
}
