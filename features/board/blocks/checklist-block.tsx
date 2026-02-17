import { useEffect, useState } from "react";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
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
    setItems(nextItems);
    void updateBlockContent({
      id: block.id,
      content: {
        items: nextItems
      }
    });
  };

  const handleAdd = () => {
    const nextItems = [
      ...items,
      {
        id: crypto.randomUUID(),
        text: "",
        checked: false
      }
    ];
    persist(nextItems);
  };

  const handleToggle = (id: string) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    persist(nextItems);
  };

  const handleChangeText = (id: string, text: string) => {
    const nextItems = items.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    persist(nextItems);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Checklist</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1 text-[11px]"
          onClick={handleAdd}
        >
          + item
        </Button>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-2 text-[12px] text-slate-700"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggle(item.id)}
              className="h-3 w-3 rounded border-slate-300 text-sky-500"
            />
            <Input
              value={item.text}
              onChange={(event) =>
                handleChangeText(item.id, event.target.value)
              }
              placeholder="Task..."
              className="h-7 border-none bg-transparent px-0 text-[12px] shadow-none placeholder:text-slate-400 focus-visible:ring-0"
            />
          </label>
        ))}
        {items.length === 0 && (
          <button
            type="button"
            onClick={handleAdd}
            className="text-[12px] text-sky-600 underline-offset-2 hover:underline"
          >
            Add first item
          </button>
        )}
      </div>
    </div>
  );
}

