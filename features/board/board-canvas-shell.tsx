"use client";

import { useEffect } from "react";
import type { BoardDto } from "@/services/boards";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { BoardCanvas } from "@/features/board/board-canvas";

interface BoardCanvasShellProps {
  initialBoard: BoardDto;
  initialBlocks: BlockDto[];
}

export function BoardCanvasShell({
  initialBoard,
  initialBlocks
}: BoardCanvasShellProps) {
  const { setInitialData } = useBoardStore();

  useEffect(() => {
    console.log("[BoardCanvasShell] Setting initial data", { initialBoard, initialBlocks });
    setInitialData(initialBoard, initialBlocks);
    console.log("[BoardCanvasShell] Initial data set successfully");
  }, [initialBoard, initialBlocks, setInitialData]);

  return (
    <div className="flex h-full flex-col">
      <BoardCanvas parentBlockId={null} />
    </div>
  );
}
