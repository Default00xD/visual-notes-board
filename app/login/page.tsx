import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GoogleLoginButton } from "@/features/auth/google-login-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 px-4">
      <Card className="w-full max-w-md border border-neutral-800/70 bg-neutral-900/80 backdrop-blur-xl shadow-[0_0_80px_rgba(56,189,248,0.25)]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight text-neutral-50">
            Visual Notes Board
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-400">
            Войдите через Google, чтобы создать свою визуальную доску и
            организовать заметки в современном SaaS-интерфейсе.
          </p>
          <GoogleLoginButton />
          <p className="text-[11px] text-neutral-500">
            Авторизация и хранение данных выполняются через Supabase
            (PostgreSQL + Auth). В будущем будет добавлена подписочная модель
            (free / pro).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

