import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { motion } from "framer-motion";

interface LikesContent {
  count: number;
  [key: string]: Json | undefined;
}

interface LikesBlockProps {
  block: BlockDto;
}

export function LikesBlock({ block }: LikesBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as LikesContent | null)?.count ?? 0;
  const [count, setCount] = useState<number>(initial);

  useEffect(() => {
    setCount(initial);
  }, [initial]);

  const handleLike = () => {
    const next = count + 1;
    setCount(next);
    void updateBlockContent({
      id: block.id,
      content: {
        count: next
      }
    });
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <motion.button
        type="button"
        onClick={handleLike}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/90 text-white shadow-lg shadow-rose-500/40 border border-rose-400/50"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1, boxShadow: "0 0 20px rgba(244, 63, 94, 0.6)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="text-xl">♥</span>
      </motion.button>
      <motion.div
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-sm font-semibold text-rose-400"
      >
        {count} like{count !== 1 ? "s" : ""}
      </motion.div>
    </div>
  );
}
