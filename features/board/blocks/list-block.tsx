import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ListContent {
  items: string[];
  [key: string]: Json | undefined;
}

interface ListBlockProps {
  block: BlockDto;
}

export function ListBlock({ block }: ListBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as ListContent | null)?.items ?? [];
  const [items, setItems] = useState<string[]>(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const persist = (nextItems: string[]) => {
    console.log("[ListBlock] Persist - updating items", { blockId: block.id, itemsCount: nextItems.length });
    setItems(nextItems);
    void updateBlockContent({
      id: block.id,
      content: {
        items: nextItems
      }
    }).then(() => {
      console.log("[ListBlock] Persist - items saved", { blockId: block.id, itemsCount: nextItems.length });
    }).catch((error) => {
      console.error("[ListBlock] Persist - failed to save items", { blockId: block.id, error });
    });
  };

  const handleAdd = () => {
    console.log("[ListBlock] Add item - start", { blockId: block.id, currentItemsCount: items.length });
    const nextItems = [...items, ""];
    persist(nextItems);
    console.log("[ListBlock] Add item - completed", { blockId: block.id, newItemsCount: nextItems.length });
  };

  const handleChange = (index: number, value: string) => {
    console.log("[ListBlock] Change item - start", { blockId: block.id, index, valueLength: value.length });
    const nextItems = items.map((item, i) => (i === index ? value : item));
    persist(nextItems);
    console.log("[ListBlock] Change item - completed", { blockId: block.id, index });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>List</span>
        <motion.div whileHover={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700/50"
            onClick={handleAdd}
          >
            + item
          </Button>
        </motion.div>
      </div>
      <ol className="space-y-1 text-[12px] text-slate-300">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-1"
          >
            <span className="mt-1 text-[11px] text-slate-500">
              {index + 1}.
            </span>
            <Input
              value={item}
              onChange={(event) => handleChange(index, event.target.value)}
              placeholder="List item..."
              className="h-7 border-none bg-transparent px-0 text-[12px] text-slate-300 placeholder:text-slate-500 focus-visible:ring-0 focus:text-white"
            />
          </motion.li>
        ))}
        {items.length === 0 && (
          <motion.button
            whileHover={{ scale: 1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleAdd}
            className="text-[12px] text-primary underline-offset-2 hover:underline"
          >
            Add first item
          </motion.button>
        )}
      </ol>
    </div>
  );
}
