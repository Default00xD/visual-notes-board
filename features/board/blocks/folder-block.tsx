"use client";

import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";

interface FolderContent {
  title?: string;
}

interface FolderBlockProps {
  block: BlockDto;
}

export function FolderBlock({ block }: FolderBlockProps) {
  const { blocks, setOpenFolderId, updateBlockContent } = useBoardStore();
  const content = (block.content as FolderContent | null) ?? {};
  const nestedCount = blocks.filter(
    (b) => b.parentBlockId === block.id
  ).length;

  const handleOpen = () => {
    setOpenFolderId(block.id);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
    const title = event.target.value;
    void updateBlockContent({
      id: block.id,
      content: {
        title
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="flex h-full w-full flex-col items-start justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50/90 px-3 py-2 text-left transition hover:border-sky-300 hover:bg-sky-50"
    >
      <div className="space-y-1">
        <input
          defaultValue={content.title ?? "Folder"}
          onBlur={handleBlur}
          className="w-full border-none bg-transparent p-0 text-[13px] font-medium text-slate-800 outline-none"
        />
        <p className="text-[11px] text-slate-500">
          {nestedCount} nested block{nestedCount === 1 ? "" : "s"}
        </p>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Click to open inner board
      </p>
    </button>
  );
}

