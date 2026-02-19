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
      <div className="space-y-1">
        {items.map((item) => (
          <motion.label
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-2 rounded-md px-1 py-0.5 text-[12px] text-neutral-200 transition-colors hover:bg-neutral-800/60"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggle(item.id)}
              className="h-3.5 w-3.5 rounded border-neutral-600 bg-neutral-900 text-primary focus:ring-primary"
            />
            <Input
              value={item.text}
              onChange={(event) =>
                handleChangeText(item.id, event.target.value)
              }
              placeholder="Новая задача"
              className={`h-7 border-none bg-transparent px-0 text-[12px] shadow-none placeholder:text-neutral-500 focus-visible:ring-0 ${
                item.checked
                  ? "text-neutral-500 line-through"
                  : "text-neutral-200"
              }`}
            />
          </motion.label>
        ))}
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-1 py-1 text-[12px] text-neutral-400 transition-colors hover:text-primary"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-600 text-[11px]">
            +
          </span>
          <span>Добавить пункт</span>
        </motion.button>
      </div>
    </div>
  );
}
