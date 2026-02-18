import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectedFrom =
    requestUrl.searchParams.get("redirectedFrom") ?? "/app";

  if (!code) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const cookieStore = cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        }
      }
    }
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    // Ensure the app user exists and has subscription_status
    const { id: authUserId, user_metadata, email } = user;

    // Google OAuth provides: full_name, avatar_url, email
    const username =
      (user_metadata.full_name as string | undefined) ??
      (user_metadata.name as string | undefined) ??
      email?.split("@")[0] ??
      null;

    const avatar =
      (user_metadata.avatar_url as string | undefined) ??
      (user_metadata.picture as string | undefined) ??
      null;

    await supabase.from("app_users").upsert(
      {
        auth_user_id: authUserId,
        telegram_id: null, // Not used for Google OAuth
        username,
        avatar,
        subscription_status: "free"
      },
      {
        onConflict: "auth_user_id"
      }
    );
  }

  return NextResponse.redirect(new URL(redirectedFrom, requestUrl.origin));
}

