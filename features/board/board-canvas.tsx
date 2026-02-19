"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, Folder, Image, Plus, Type } from "lucide-react";
import { useBoardStore } from "@/store/board-store";
import { BlockCard } from "@/features/board/block-card";
import { FolderOverlay } from "@/features/board/folder-overlay";
import type { BlockType } from "@/services/blocks";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface BoardCanvasProps {
  parentBlockId: string | null;
}

const GRID_SIZE = 20;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export function BoardCanvas({ parentBlockId }: BoardCanvasProps) {
  const { currentBoard, blocks, openFolderId, setOpenFolderId, createBlock } =
    useBoardStore();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const scopedBlocks = blocks.filter(
    (block) => block.parentBlockId === parentBlockId
  );

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      console.log("[BoardCanvas] Add block - start", { type, parentBlockId, scopedBlocksCount: scopedBlocks.length });
      createBlock({
        type,
        parentBlockId,
        x: snapToGrid(80 + scopedBlocks.length * 24),
        y: snapToGrid(80 + scopedBlocks.length * 16)
      }).then(() => {
        console.log("[BoardCanvas] Add block - completed", { type, parentBlockId });
      }).catch((error) => {
        console.error("[BoardCanvas] Add block - failed", { type, parentBlockId, error });
      });
    },
    [createBlock, parentBlockId, scopedBlocks.length]
  );

  if (!currentBoard) {
    return null;
  }

  return (
    <>
      <div className="relative flex-1 overflow-hidden">
        <div className="relative h-full w-full">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] [background-size:24px_24px]" />

          <div className="relative z-10 h-full w-full">
            <div className="absolute inset-x-0 bottom-6 z-20 flex items-end justify-center">
              <div className="flex flex-col items-center gap-3">
                <AnimatePresence>
                  {isPaletteOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-2 rounded-full bg-neutral-900/90 px-3 py-2 shadow-soft border border-neutral-800/70 backdrop-blur-sm"
                    >
                      <motion.button
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          handleAddBlock("text");
                          setIsPaletteOpen(false);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 hover:bg-primary/80 hover:text-neutral-950 transition-colors"
                      >
                        <Type className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          handleAddBlock("checklist");
                          setIsPaletteOpen(false);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 hover:bg-primary/80 hover:text-neutral-950 transition-colors"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          handleAddBlock("image");
                          setIsPaletteOpen(false);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 hover:bg-primary/80 hover:text-neutral-950 transition-colors"
                      >
                        <Image className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.06, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          handleAddBlock("folder");
                          setIsPaletteOpen(false);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 hover:bg-primary/80 hover:text-neutral-950 transition-colors"
                      >
                        <Folder className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setIsPaletteOpen((prev) => !prev)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-800/70 bg-neutral-900/90 text-neutral-200 shadow-soft backdrop-blur-sm hover:border-primary/70 hover:text-primary"
                >
                  <Plus className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {scopedBlocks.map((block) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
              >
                <BlockCard block={block} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {openFolderId && (() => {
        const folder = blocks.find((b) => b.id === openFolderId);
        if (!folder || folder.parentBlockId !== parentBlockId) return null;

        return (
          <FolderOverlay
            folderId={openFolderId}
            onClose={() => {
              console.log("[BoardCanvas] Folder overlay - close clicked", { folderId: openFolderId });
              setOpenFolderId(null);
              console.log("[BoardCanvas] Folder overlay - closed", { folderId: openFolderId });
            }}
          />
        );
      })()}
    </>
  );
}
