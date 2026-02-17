"use client";

import { motion } from "framer-motion";
import { useBoardStore } from "@/store/board-store";
import { BoardCanvas } from "@/features/board/board-canvas";
import { Button } from "@/components/ui/button";

interface FolderOverlayProps {
  folderId: string;
  onClose: () => void;
}

export function FolderOverlay({ folderId, onClose }: FolderOverlayProps) {
  const { blocks } = useBoardStore();
  const folder = blocks.find((block) => block.id === folderId);

  if (!folder) return null;

  const title =
    (folder.content as { title?: string } | null)?.title ?? "Folder";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="relative h-[70vh] w-[70vw] max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 shadow-2xl"
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
      >
        <div className="flex items-center justify-between border-b bg-white/80 px-4 py-2 text-sm backdrop-blur">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{title}</span>
            <span className="text-[11px] text-slate-500">
              Inner visual board — create nested blocks freely.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-xs"
          >
            Close
          </Button>
        </div>
        <div className="h-full w-full">
          <BoardCanvas parentBlockId={folderId} />
        </div>
      </motion.div>
    </motion.div>
  );
}

