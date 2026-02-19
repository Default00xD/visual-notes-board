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
  const { blocks, setOpenFolderId } = useBoardStore();
  const content = (block.content as FolderContent | null) ?? {};
  const nestedCount = blocks.filter(
    (b) => b.parentBlockId === block.id
  ).length;

  const handleOpen = () => {
    console.log("[FolderBlock] Open clicked", { blockId: block.id, folderTitle: content.title });
    setOpenFolderId(block.id);
    console.log("[FolderBlock] Open - folder ID set", { blockId: block.id });
  };

  return (
    <motion.button
      type="button"
      onClick={handleOpen}
      whileHover={{ scale: 1 }}
      whileTap={{ scale: 0.98 }}
      className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-600/50 bg-slate-800/50 px-4 py-3 text-center transition-all hover:border-primary/50 hover:bg-slate-800/70"
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
          className="mt-2 text-xs text-slate-400"
        >
          {nestedCount} block{nestedCount === 1 ? "" : "s"}
        </motion.p>
      )}
    </motion.button>
  );
}
