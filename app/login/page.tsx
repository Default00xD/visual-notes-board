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
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md smooth-shadow border-0 bg-white/90 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-xl font-semibold tracking-tight">
            Visual Notes Board
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Войдите через Google, чтобы создать свою визуальную доску и
            организовать заметки в современном SaaS-интерфейсе.
          </p>
          <GoogleLoginButton />
          <p className="text-[11px] text-muted-foreground">
            Авторизация и хранение данных выполняются через Supabase
            (PostgreSQL + Auth). В будущем будет добавлена подписочная модель
            (free / pro).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

