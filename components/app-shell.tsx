import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@/components/user-button";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link
            href="/app"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-xs text-primary-foreground shadow-sm">
              V
            </span>
            <span>Visual Notes Board</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/app">Boards</Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
        {children}
      </main>
    </div>
  );
}

