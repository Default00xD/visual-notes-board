"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@/components/user-button";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { useBoardStore } from "@/store/board-store";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { currentBoard, blocks, saveAllChanges, hasUnsavedChanges } = useBoardStore();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    console.log("[AppShell] Save button clicked", { hasUnsavedChanges, isSaving });
    if (!hasUnsavedChanges || isSaving) {
      console.log("[AppShell] Save skipped - no changes or already saving");
      return;
    }
    setIsSaving(true);
    console.log("[AppShell] Starting save operation...");
    try {
      await saveAllChanges();
      console.log("[AppShell] Save operation completed successfully");
    } catch (error) {
      console.error("[AppShell] Save operation failed", error);
    } finally {
      setIsSaving(false);
      console.log("[AppShell] Save operation finished");
    }
  };

  const handleExport = () => {
    console.log("[AppShell] Export button clicked", { currentBoard, blocksCount: blocks.length });
    if (!currentBoard) {
      console.log("[AppShell] Export skipped - no current board");
      return;
    }
    const payload = {
      board: currentBoard,
      blocks
    };
    console.log("[AppShell] Creating export file...", payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `board-${currentBoard.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("[AppShell] Export file downloaded successfully");
  };

  return (
    <div className="flex h-full flex-col">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 border-b border-neutral-800/50 bg-neutral-950/80 backdrop-blur-md w-full"
      >
        <div className="grid h-14 w-full grid-cols-[auto,1fr,auto] items-center px-6">
          <div className="flex items-center">
            <Link
              href="/app"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-all hover:opacity-80"
              onClick={() => console.log("[AppShell] Logo clicked - navigating to /app")}
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
          </div>

          <div className="flex items-center justify-center">
            <span className="text-[11px] font-medium tracking-[0.18em] uppercase text-neutral-500">
              version 1.0
            </span>
          </div>

          <div className="flex items-center justify-end gap-3">
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-400">Unsaved changes</span>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white hover:border-primary/50"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export JSON
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white hover:border-primary/50"
                onClick={() => console.log("[AppShell] Boards button clicked")}
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
