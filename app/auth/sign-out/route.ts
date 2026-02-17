import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
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

  await supabase.auth.signOut();

  const response = NextResponse.redirect(
    new URL("/login", requestUrl.origin),
    {
      status: 303
    }
  );

  return response;
}

