"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
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

export function BoardCanvas({ parentBlockId }: BoardCanvasProps) {
  const { currentBoard, blocks, openFolderId, setOpenFolderId, createBlock } =
    useBoardStore();

  const scopedBlocks = blocks.filter(
    (block) => block.parentBlockId === parentBlockId
  );

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      createBlock({
        type,
        parentBlockId,
        x: 80 + scopedBlocks.length * 24,
        y: 80 + scopedBlocks.length * 16
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    },
    [createBlock, parentBlockId, scopedBlocks.length]
  );

  if (!currentBoard) {
    return null;
  }

  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="relative h-full w-full">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] [background-size:24px_24px]" />

        <div className="relative z-10 h-full w-full">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-2 z-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex cursor-pointer rounded-full border border-neutral-800/50 bg-neutral-900/90 backdrop-blur-sm p-1.5 shadow-lg transition-all hover:border-primary/50"
                >
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-neutral-300 hover:text-primary hover:bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 z-50">
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("text")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  Text block
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("checklist")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  Checklist
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("list")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  List
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("likes")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  Likes
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("image")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleAddBlock("folder")}
                  className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                >
                  Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <AnimatePresence mode="wait">
        {openFolderId && (
          <FolderOverlay
            key={openFolderId}
            folderId={openFolderId}
            onClose={() => setOpenFolderId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
