"use client";

import { useEffect, useState } from "react";
import type { BoardDto } from "@/services/boards";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { BoardCanvas } from "@/features/board/board-canvas";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { motion } from "framer-motion";

interface BoardCanvasShellProps {
  initialBoard: BoardDto;
  initialBlocks: BlockDto[];
}

export function BoardCanvasShell({
  initialBoard,
  initialBlocks
}: BoardCanvasShellProps) {
  const { setInitialData, currentBoard, blocks, saveAllChanges } = useBoardStore();
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setInitialData(initialBoard, initialBlocks);
  }, [initialBoard, initialBlocks, setInitialData]);

  useEffect(() => {
    // Track if there are unsaved changes
    const hasChanges = JSON.stringify(blocks) !== JSON.stringify(initialBlocks);
    setHasUnsavedChanges(hasChanges);
  }, [blocks, initialBlocks]);

  const handleExport = () => {
    if (!currentBoard) return;
    const payload = {
      board: currentBoard,
      blocks
    };
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
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      await saveAllChanges();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save changes", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/50 backdrop-blur-sm px-4 py-3 text-sm"
      >
        <div className="flex flex-col">
          <span className="font-semibold text-neutral-100">
            {initialBoard.title}
          </span>
          <span className="text-[11px] text-neutral-400 mt-0.5">
            Drag & drop, nested folders, smooth SaaS-grade canvas.
          </span>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </motion.div>
      <BoardCanvas parentBlockId={null} />
    </div>
  );
}
