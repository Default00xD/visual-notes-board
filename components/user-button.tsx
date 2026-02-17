import { cookies } from "next/headers";
import Link from "next/link";

// Simple user indicator placeholder; in a real app you'd
// fetch current user via Supabase and show avatar.

export function UserButton() {
  const cookieStore = cookies();
  const hasSessionCookie =
    cookieStore.get("sb-access-token") ?? cookieStore.get("sb-refresh-token");

  if (!hasSessionCookie) {
    return (
      <Link
        href="/login"
        className="rounded-full border bg-white px-3 py-1 text-xs font-medium shadow-sm hover:bg-slate-50"
      >
        Login
      </Link>
    );
  }

  return (
    <form action="/auth/sign-out" method="post">
      <button
        type="submit"
        className="rounded-full border bg-white px-3 py-1 text-xs font-medium shadow-sm hover:bg-slate-50"
      >
        Sign out
      </button>
    </form>
  );
}

