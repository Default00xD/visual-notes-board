import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";

const PROTECTED_PATHS_PREFIXES = ["/app", "/api/boards", "/api/blocks"];

export async function middleware(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const pathname = requestUrl.pathname;

  const isProtected = PROTECTED_PATHS_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Placeholder for future subscription-based access control.
  // Here you can load the user's subscription_status from app_users table
  // and enforce limits (e.g., number of blocks for free plan).

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/api/boards/:path*", "/api/blocks/:path*"]
};

