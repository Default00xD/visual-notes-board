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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e2e8f0_1px,transparent_0)] [background-size:18px_18px] opacity-50" />

        <div className="relative z-10 h-full w-full">
          <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-500 shadow-sm backdrop-blur">
              <span>Click + to add blocks</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex cursor-pointer rounded-full border bg-white/90 p-1 shadow-sm backdrop-blur">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAddBlock("text")}>
                  Text block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("checklist")}>
                  Checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("list")}>
                  List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("likes")}>
                  Likes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("image")}>
                  Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddBlock("folder")}>
                  Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {scopedBlocks.map((block) => (
            <motion.div
              key={block.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 24
              }}
              style={{
                position: "absolute",
                inset: 0
              }}
            >
              <BlockCard block={block} />
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {openFolderId && (
          <FolderOverlay
            folderId={openFolderId}
            onClose={() => setOpenFolderId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

