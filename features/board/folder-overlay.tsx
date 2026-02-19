"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
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
  const { blocks, openFolderOrigin, setFolderContainerRect, folderContainerRects } =
    useBoardStore();
  const folder = blocks.find((block) => block.id === folderId);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const targetRect = useMemo(() => {
    if (!folder.parentBlockId) {
      const width = window.innerWidth * 0.5;
      const height = window.innerHeight * 0.5;
      return {
        width,
        height,
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2
      };
    }
    const parent = folderContainerRects[folder.parentBlockId];
    if (parent) return parent;
    // Fallback: same as root until parent rect is known
    const width = window.innerWidth * 0.5;
    const height = window.innerHeight * 0.5;
    return {
      width,
      height,
      left: (window.innerWidth - width) / 2,
      top: (window.innerHeight - height) / 2
    };
  }, [folder.parentBlockId, folderContainerRects]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setFolderContainerRect({
      folderId,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    });
  }, [folderId, setFolderContainerRect, targetRect.left, targetRect.top, targetRect.width, targetRect.height]);

  const overlayContent = (
    <AnimatePresence>
      <motion.div
        className={`${isRootFolder ? "fixed inset-0" : "fixed inset-0"} z-[100] bg-transparent`}
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
          ref={containerRef}
          className="absolute overflow-hidden rounded-2xl border border-neutral-800/70 shadow-2xl"
          initial={
            openFolderOrigin
              ? {
                  top: openFolderOrigin.top,
                  left: openFolderOrigin.left,
                  width: openFolderOrigin.width,
                  height: openFolderOrigin.height,
                  borderRadius: 16,
                  opacity: 0.9
                }
              : {
                  top: targetRect.top + 10,
                  left: targetRect.left,
                  width: targetRect.width,
                  height: targetRect.height,
                  borderRadius: 16,
                  opacity: 0.9
                }
          }
          animate={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            borderRadius: 16,
            opacity: 1
          }}
          exit={{
            top: openFolderOrigin?.top ?? targetRect.top,
            left: openFolderOrigin?.left ?? targetRect.left,
            width: openFolderOrigin?.width ?? targetRect.width,
            height: openFolderOrigin?.height ?? targetRect.height,
            opacity: 0
          }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-800/50 bg-neutral-950/40 px-4 py-2">
            <div className="flex flex-col">
              <span className="font-semibold text-neutral-100 text-sm">{title}</span>
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
          <div className="h-[calc(100%-2.5rem)] w-full">
            <BoardCanvas parentBlockId={folderId} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return overlayContent;
}
