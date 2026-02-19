"use client";

import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { motion } from "framer-motion";

interface FolderContent {
  title?: string;
  [key: string]: Json | undefined;
}

interface FolderBlockProps {
  block: BlockDto;
}

export function FolderBlock({ block }: FolderBlockProps) {
  const { blocks, dragState } = useBoardStore();
  const content = (block.content as FolderContent | null) ?? {};
  const nestedCount = blocks.filter(
    (b) => b.parentBlockId === block.id
  ).length;

  const isDropTarget = (() => {
    if (!dragState) return false;
    if (dragState.blockId === block.id) return false;
    if (dragState.parentBlockId !== block.parentBlockId) return false;
    const withinX =
      dragState.centerX >= block.x && dragState.centerX <= block.x + block.width;
    const withinY =
      dragState.centerY >= block.y && dragState.centerY <= block.y + block.height;
    return withinX && withinY;
  })();

  return (
    <motion.div
      animate={
        isDropTarget
          ? {
              scale: 1.02
            }
          : { scale: 1 }
      }
      className={`flex h-full w-full flex-col items-center justify-center rounded-lg border border-neutral-700/60 bg-neutral-950/20 px-4 py-3 text-center transition-all ${
        isDropTarget ? "border-neutral-300/40 bg-neutral-900/40 shadow-[0_0_40px_rgba(255,255,255,0.08)]" : "hover:bg-neutral-900/30"
      }`}
    >
      <div
        className="w-full px-1 text-center text-2xl font-bold tracking-widest text-slate-200 uppercase leading-tight overflow-hidden"
        style={{
          wordBreak: "break-word",
          overflowWrap: "break-word",
          maxHeight: "3.2em"
        }}
      >
        {content.title?.trim() || "FOLDER"}
      </div>
      {nestedCount > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-xs text-neutral-400"
        >
          {nestedCount} block{nestedCount === 1 ? "" : "s"}
        </motion.p>
      )}
    </motion.div>
  );
}
