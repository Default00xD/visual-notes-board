import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Visual Notes Board",
  description: "Visual SaaS-grade notes board with nested blocks and Telegram login."
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased",
          "flex flex-col"
        )}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

