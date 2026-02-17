"use client";

import { useEffect } from "react";
import type { BoardDto } from "@/services/boards";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { BoardCanvas } from "@/features/board/board-canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface BoardCanvasShellProps {
  initialBoard: BoardDto;
  initialBlocks: BlockDto[];
}

export function BoardCanvasShell({
  initialBoard,
  initialBlocks
}: BoardCanvasShellProps) {
  const { setInitialData, currentBoard, blocks } = useBoardStore();

  useEffect(() => {
    setInitialData(initialBoard, initialBlocks);
  }, [initialBoard, initialBlocks, setInitialData]);

  const handleExport = () => {
    if (!currentBoard) return;
    const payload = {
      board: currentBoard,
      blocks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `board-${currentBoard.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-white/80 px-4 py-2 text-sm backdrop-blur">
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">
            {initialBoard.title}
          </span>
          <span className="text-[11px] text-slate-500">
            Drag & drop, nested folders, smooth SaaS-grade canvas.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-1 h-3 w-3" />
            Export JSON
          </Button>
        </div>
      </div>
      <BoardCanvas parentBlockId={null} />
    </div>
  );
}

