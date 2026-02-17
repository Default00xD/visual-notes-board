import { useEffect, useState } from "react";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { motion } from "framer-motion";

interface LikesContent {
  count: number;
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
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <motion.button
        type="button"
        onClick={handleLike}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/40"
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 260, damping: 16 }}
      >
        <span className="text-lg">♥</span>
      </motion.button>
      <div className="text-xs font-medium text-rose-600">{count} likes</div>
    </div>
  );
}

