"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@/components/user-button";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-full flex-col">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md"
      >
        <div className="container flex h-14 items-center justify-between">
          <Link
            href="/app"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-all hover:opacity-80"
          >
            <motion.span
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-xs text-primary-foreground shadow-lg"
            >
              V
            </motion.span>
            <span className="text-neutral-100">Visual Notes Board</span>
          </Link>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white hover:border-primary/50"
              >
                <Link href="/app">Boards</Link>
              </Button>
            </motion.div>
            <UserButton />
          </div>
        </div>
      </motion.header>
      <main className="flex-1 overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        {children}
      </main>
    </div>
  );
}
