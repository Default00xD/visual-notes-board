"use client";

import { motion } from "framer-motion";
import { useBoardStore } from "@/store/board-store";
import { BoardCanvas } from "@/features/board/board-canvas";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="relative h-[85vh] w-[90vw] max-w-6xl overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800/50 shadow-2xl"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/50 px-6 py-3 backdrop-blur-sm">
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-100 text-lg">{title}</span>
            <span className="text-[11px] text-neutral-400 mt-0.5">
              Inner visual board — create nested blocks freely.
            </span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-300 hover:text-white hover:bg-neutral-800/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        <div className="h-[calc(85vh-4rem)] w-full">
          <BoardCanvas parentBlockId={folderId} />
        </div>
      </motion.div>
    </motion.div>
  );
}
