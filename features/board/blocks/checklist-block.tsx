import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockColor, BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

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

  const tintByColor: Record<BlockColor, { rowHover: string; checkOn: string; checkBorder: string; checkIcon: string }> =
    {
      dark: {
        rowHover: "hover:bg-neutral-800/70",
        checkOn: "bg-white",
        checkBorder: "border-neutral-600",
        checkIcon: "text-neutral-600"
      },
      slate: {
        rowHover: "hover:bg-slate-700/30",
        checkOn: "bg-white",
        checkBorder: "border-slate-600",
        checkIcon: "text-slate-600"
      },
      amber: {
        rowHover: "hover:bg-amber-500/10",
        checkOn: "bg-white",
        checkBorder: "border-amber-600/70",
        checkIcon: "text-amber-600"
      },
      emerald: {
        rowHover: "hover:bg-emerald-500/10",
        checkOn: "bg-white",
        checkBorder: "border-emerald-600/70",
        checkIcon: "text-emerald-600"
      },
      sky: {
        rowHover: "hover:bg-sky-500/10",
        checkOn: "bg-white",
        checkBorder: "border-sky-600/70",
        checkIcon: "text-sky-600"
      },
      violet: {
        rowHover: "hover:bg-violet-500/10",
        checkOn: "bg-white",
        checkBorder: "border-violet-600/70",
        checkIcon: "text-violet-600"
      },
      rose: {
        rowHover: "hover:bg-rose-500/10",
        checkOn: "bg-white",
        checkBorder: "border-rose-600/70",
        checkIcon: "text-rose-600"
      }
    };

  const tint = tintByColor[block.color] ?? tintByColor.dark;

  return (
    <div className="space-y-1.5">
      <div className="space-y-1">
        {items.map((item) => (
          <motion.label
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group flex items-center gap-2 rounded-md px-1 py-0.5 text-[14px] text-neutral-200 transition-colors ${tint.rowHover}`}
          >
            <span className="relative inline-flex items-center justify-center">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                className="peer sr-only"
              />
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 shadow-sm transition-all ${tint.checkBorder} peer-focus-visible:ring-0 ${
                  item.checked ? tint.checkOn : "bg-transparent"
                }`}
              >
                <Check
                  className={`h-3.5 w-3.5 transition-opacity ${item.checked ? `opacity-100 ${tint.checkIcon}` : "opacity-0"}`}
                />
              </span>
            </span>
            <Input
              value={item.text}
              onChange={(event) =>
                handleChangeText(item.id, event.target.value)
              }
              placeholder="Новая задача"
              className={`h-7 border-none bg-transparent px-0 text-[14px] shadow-none placeholder:text-neutral-500 focus-visible:ring-0 focus-visible:outline-none ${
                item.checked ? "text-neutral-300" : "text-neutral-200"
              }`}
            />
          </motion.label>
        ))}
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-1 py-1 text-[14px] text-neutral-400 transition-colors hover:text-primary"
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
