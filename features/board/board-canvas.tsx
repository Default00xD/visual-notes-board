"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckSquare, Folder, Image, Plus, Type } from "lucide-react";
import { useBoardStore } from "@/store/board-store";
import { BlockCard } from "@/features/board/block-card";
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
  return Math.round(value / (GRID_SIZE / 2)) * (GRID_SIZE / 2);
};

export function BoardCanvas({ parentBlockId }: BoardCanvasProps) {
  const { currentBoard, blocks, createBlock } =
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
              <motion.div
                onMouseEnter={() => setIsPaletteOpen(true)}
                onMouseLeave={() => setIsPaletteOpen(false)}
                animate={{ width: isPaletteOpen ? 220 : 44 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="flex h-11 items-center gap-2 overflow-hidden rounded-full border border-neutral-800/70 bg-neutral-900/90 px-2 shadow-soft backdrop-blur-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-200">
                  <motion.div
                    animate={{
                      rotate: isPaletteOpen ? 135 : 0,
                      scale: isPaletteOpen ? 1.05 : 1
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Plus className="h-5 w-5" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {isPaletteOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleAddBlock("text")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 transition-colors hover:bg-primary/80 hover:text-neutral-950"
                        aria-label="Add text block"
                      >
                        <Type className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleAddBlock("checklist")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 transition-colors hover:bg-primary/80 hover:text-neutral-950"
                        aria-label="Add checklist block"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleAddBlock("image")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 transition-colors hover:bg-primary/80 hover:text-neutral-950"
                        aria-label="Add image block"
                      >
                        <Image className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => handleAddBlock("folder")}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-200 transition-colors hover:bg-primary/80 hover:text-neutral-950"
                        aria-label="Add folder block"
                      >
                        <Folder className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
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

    </>
  );
}
