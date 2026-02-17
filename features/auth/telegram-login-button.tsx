"use client";

import { useTransition } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { TelegramIcon } from "@/features/auth/telegram-icon";

export function TelegramLoginButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = () => {
    startTransition(async () => {
      const supabase = getSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "telegram",
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
      className="w-full gap-2 bg-[#229ED9] hover:bg-[#229ED9]/90"
      onClick={handleLogin}
      disabled={isPending}
    >
      <TelegramIcon className="h-4 w-4" />
      {isPending ? "Перенаправление в Telegram…" : "Войти через Telegram"}
    </Button>
  );
}

