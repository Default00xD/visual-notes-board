import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    setItems(nextItems);
    void updateBlockContent({
      id: block.id,
      content: {
        items: nextItems
      }
    });
  };

  const handleAdd = () => {
    const nextItems = [...items, ""];
    persist(nextItems);
  };

  const handleChange = (index: number, value: string) => {
    const nextItems = items.map((item, i) => (i === index ? value : item));
    persist(nextItems);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>List</span>
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
      <ol className="space-y-1 text-[12px] text-slate-700">
        {items.map((item, index) => (
          <li key={index} className="flex gap-1">
            <span className="mt-1 text-[11px] text-slate-400">
              {index + 1}.
            </span>
            <Input
              value={item}
              onChange={(event) => handleChange(index, event.target.value)}
              placeholder="List item..."
              className="h-7 border-none bg-transparent px-0 text-[12px] shadow-none placeholder:text-slate-400 focus-visible:ring-0"
            />
          </li>
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
      </ol>
    </div>
  );
}

