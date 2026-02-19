import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  [key: string]: Json | undefined;
}

interface ChecklistContent {
  items: ChecklistItem[];
}

interface ChecklistBlockProps {
  block: BlockDto;
}

export function ChecklistBlock({ block }: ChecklistBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial =
    (block.content as ChecklistContent | null)?.items ??
    ([] as ChecklistItem[]);
  const [items, setItems] = useState<ChecklistItem[]>(initial);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const persist = (nextItems: ChecklistItem[]) => {
    console.log("[ChecklistBlock] Persist - updating items", { blockId: block.id, itemsCount: nextItems.length });
    setItems(nextItems);
    void updateBlockContent({
      id: block.id,
      content: {
        items: nextItems
      }
    }).then(() => {
      console.log("[ChecklistBlock] Persist - items saved", { blockId: block.id, itemsCount: nextItems.length });
    }).catch((error) => {
      console.error("[ChecklistBlock] Persist - failed to save items", { blockId: block.id, error });
    });
  };

  const handleAdd = () => {
    console.log("[ChecklistBlock] Add item - start", { blockId: block.id, currentItemsCount: items.length });
    const nextItems = [
      ...items,
      {
        id: crypto.randomUUID(),
        text: "",
        checked: false
      }
    ];
    persist(nextItems);
    console.log("[ChecklistBlock] Add item - completed", { blockId: block.id, newItemsCount: nextItems.length });
  };

  const handleToggle = (id: string) => {
    console.log("[ChecklistBlock] Toggle item - start", { blockId: block.id, itemId: id });
    const item = items.find((i) => i.id === id);
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    persist(nextItems);
    console.log("[ChecklistBlock] Toggle item - completed", { blockId: block.id, itemId: id, newChecked: !item?.checked });
  };

  const handleChangeText = (id: string, text: string) => {
    console.log("[ChecklistBlock] Change text - start", { blockId: block.id, itemId: id, textLength: text.length });
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    persist(nextItems);
    console.log("[ChecklistBlock] Change text - completed", { blockId: block.id, itemId: id });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Checklist</span>
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
      <div className="space-y-1">
        {items.map((item) => (
          <motion.label
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[12px] text-slate-300"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggle(item.id)}
              className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
            />
            <Input
              value={item.text}
              onChange={(event) =>
                handleChangeText(item.id, event.target.value)
              }
              placeholder="Task..."
              className="h-7 border-none bg-transparent px-0 text-[12px] text-slate-300 placeholder:text-slate-500 focus-visible:ring-0 focus:text-white"
            />
          </motion.label>
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
      </div>
    </div>
  );
}
