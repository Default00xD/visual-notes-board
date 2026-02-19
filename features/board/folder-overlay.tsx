"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    console.log("[FolderOverlay] Mounted", { folderId, folder });
    // Prevent body scroll when overlay is open
    document.body.style.overflow = "hidden";
    return () => {
      console.log("[FolderOverlay] Unmounting", { folderId });
      document.body.style.overflow = "";
    };
  }, [folderId, folder]);

  if (!folder) return null;

  const title =
    (folder.content as { title?: string } | null)?.title ?? "Folder";
  const isRootFolder = folder.parentBlockId === null;

  const containerClasses = isRootFolder
    ? "relative h-[50vh] w-[50vw] overflow-hidden rounded-2xl bg-neutral-900/80 border border-neutral-800/60 shadow-2xl"
    : "relative h-full w-full overflow-hidden rounded-2xl bg-neutral-900/70 border border-neutral-800/50 shadow-2xl";

  const overlayContent = (
    <AnimatePresence>
      <motion.div
        className={`${isRootFolder ? "fixed inset-0" : "absolute inset-0"} z-[100] flex items-center justify-center bg-neutral-950/60 backdrop-blur-md`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            console.log("[FolderOverlay] Background clicked - closing", { folderId });
            onClose();
          }
        }}
      >
        <motion.div
          className={containerClasses}
          initial={{ scale: 0.8, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-900/60 px-6 py-3 backdrop-blur-sm">
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
                onClick={() => {
                  console.log("[FolderOverlay] Close button clicked", { folderId });
                  onClose();
                }}
                className="text-neutral-300 hover:text-white hover:bg-neutral-800/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          <div className={isRootFolder ? "h-[calc(50vh-3rem)] w-full" : "h-[calc(100%-3rem)] w-full"}>
            <BoardCanvas parentBlockId={folderId} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Render to portal to avoid nesting issues
  if (typeof window !== "undefined") {
    return createPortal(overlayContent, document.body);
  }

  return overlayContent;
}
