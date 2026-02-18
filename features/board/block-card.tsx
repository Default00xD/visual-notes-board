"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent
} from "react-draggable";
import { Resizable, type ResizeCallback } from "re-resizable";
import { motion } from "framer-motion";
import { useBoardStore } from "@/store/board-store";
import type { BlockDto, BlockColor } from "@/services/blocks";
import { BlockRenderer } from "@/features/board/block-renderer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Json } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface BlockCardProps {
  block: BlockDto;
}

const COLOR_MAP: Record<BlockColor, string> = {
  slate: "bg-slate-800/90 border-slate-700/50",
  amber: "bg-amber-900/40 border-amber-700/50",
  emerald: "bg-emerald-900/40 border-emerald-700/50",
  sky: "bg-sky-900/40 border-sky-700/50",
  violet: "bg-violet-900/40 border-violet-700/50",
  rose: "bg-rose-900/40 border-rose-700/50"
};

const COLOR_DOT_MAP: Record<BlockColor, string> = {
  slate: "bg-slate-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  rose: "bg-rose-500"
};

export function BlockCard({ block }: BlockCardProps) {
  const {
    selectedBlockId,
    setSelectedBlock,
    updateBlockPositionAndSize,
    updateBlockContent,
    changeBlockColor,
    deleteBlock,
    bringToFront,
    moveBlockToFolder,
    blocks
  } = useBoardStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: block.x,
    y: block.y
  });
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const nodeRef = useRef(null);

  const title = useMemo(() => {
    const content = block.content as { title?: string } | null;
    return content?.title?.trim() ?? "";
  }, [block.content]);

  useEffect(() => {
    // Keep local position in sync with store when not actively dragging/resizing.
    if (!isDragging && !isResizing) {
      setPos({ x: block.x, y: block.y });
    }
  }, [block.x, block.y, isDragging, isResizing]);

  const handleStopDrag = (_event: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);

    const nextX = data.x;
    const nextY = data.y;

    // If dropped over a folder, move it into that folder instead of persisting position here.
    const dropCenterX = nextX + block.width / 2;
    const dropCenterY = nextY + block.height / 2;
    const candidateFolders = blocks.filter(
      (b) =>
        b.type === "folder" &&
        b.parentBlockId === block.parentBlockId &&
        b.id !== block.id
    );
    const targetFolder = candidateFolders.find((folder) => {
      const withinX =
        dropCenterX >= folder.x && dropCenterX <= folder.x + folder.width;
      const withinY =
        dropCenterY >= folder.y && dropCenterY <= folder.y + folder.height;
      return withinX && withinY;
    });

    if (targetFolder) {
      // Snap into the folder canvas with a reasonable default position.
      void moveBlockToFolder({
        blockId: block.id,
        folderId: targetFolder.id,
        x: 80,
        y: 80
      });
      return;
    }

    // Only update local state, don't save to server yet
    void updateBlockPositionAndSize({
      id: block.id,
      x: nextX,
      y: nextY,
      width: block.width,
      height: block.height
    });
  };

  const handleStartDrag = () => {
    setIsDragging(true);
    setSelectedBlock(block.id);
    void bringToFront(block.id);
  };

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    setPos({ x: data.x, y: data.y });
  };

  const handleResizeStop: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    setIsResizing(false);
    const width = ref.offsetWidth;
    const height = ref.offsetHeight;
    // Only update local state, don't save to server yet
    void updateBlockPositionAndSize({
      id: block.id,
      x: block.x,
      y: block.y,
      width,
      height
    });
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const persistTitle = (nextTitle: string) => {
    const content = (block.content as Record<string, Json>) ?? {};
    // Only update local state, don't save to server yet
    void updateBlockContent({
      id: block.id,
      content: {
        ...content,
        title: nextTitle.trim() || undefined
      }
    });
  };

  const colorClass = COLOR_MAP[block.color] ?? COLOR_MAP.slate;
  const colorDotClass = COLOR_DOT_MAP[block.color] ?? COLOR_DOT_MAP.slate;
  const isSelected = selectedBlockId === block.id;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={pos}
      onStart={handleStartDrag}
      onDrag={handleDrag}
      onStop={handleStopDrag}
      handle=".drag-handle, .drag-surface"
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          zIndex: block.zIndex
        }}
      >
        {/* motion is INSIDE the draggable node to avoid transform conflicts */}
        <motion.div
          whileHover={!isDragging && !isResizing ? { scale: 1.02 } : {}}
          transition={{ duration: 0.18 }}
        >
          <Resizable
            size={{
              width: block.width,
              height: block.height
            }}
            minWidth={200}
            minHeight={150}
            enable={{
              top: false,
              right: true,
              bottom: true,
              left: false,
              topRight: true,
              bottomRight: true,
              bottomLeft: false,
              topLeft: false
            }}
            onResizeStart={handleResizeStart}
            onResizeStop={handleResizeStop}
            className={`group flex flex-col rounded-xl border shadow-xl backdrop-blur-sm transition-all duration-200 ${colorClass} ${
              isSelected
                ? "ring-2 ring-primary shadow-2xl"
                : "ring-0 hover:ring-1 hover:ring-neutral-700/50"
            } ${isDragging ? "opacity-90" : ""}`}
          >
            {/* Header (drag handle) */}
            <div className="drag-handle relative flex items-center justify-between px-3 py-2 border-b border-neutral-800/50 cursor-move select-none">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-neutral-200">
                    {title || "Untitled"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Popover>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="h-5 w-5 rounded-full border border-neutral-700/50 shadow-sm transition-all hover:border-primary/50"
                      style={{ backgroundColor: "transparent" }}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`block h-full w-full rounded-full ${colorDotClass}`}
                      />
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-auto space-y-2 bg-neutral-900 border-neutral-800 z-[100]"
                  >
                    <div className="text-[11px] font-medium text-neutral-300">
                      Block color
                    </div>
                    <div className="flex gap-2">
                      {(
                        ["slate", "amber", "emerald", "sky", "violet", "rose"] as BlockColor[]
                      ).map((color) => (
                        <motion.button
                          key={color}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            void changeBlockColor({ id: block.id, color });
                          }}
                          className={`h-6 w-6 rounded-full border border-neutral-700/50 shadow-sm transition-all hover:border-primary/50 ${
                            COLOR_DOT_MAP[color]
                          } ${block.color === color ? "ring-2 ring-primary" : ""}`}
                        />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-neutral-200 hover:bg-neutral-800/50"
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-neutral-900 border-neutral-800 z-[100]"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenameValue(title);
                        setRenameOpen(true);
                      }}
                      className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                    >
                      Rename…
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteBlock(block.id);
                      }}
                      className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                    >
                      Delete block
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Body */}
            <div className="relative flex-1 overflow-hidden">
              {/* Drag surface under all elements */}
              <div className="drag-surface absolute inset-0 z-0 cursor-move" />
              <div className="relative z-10 h-full px-3 pb-3 pt-2 text-xs overflow-hidden">
                <BlockRenderer block={block} />
              </div>
            </div>
          </Resizable>
        </motion.div>

        <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
          <DialogContent className="max-w-md bg-neutral-950 border border-neutral-800/50 z-[200]">
            <DialogHeader>
              <DialogTitle className="text-neutral-100">Rename block</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Title…"
                className="border-neutral-800/50 bg-neutral-900/50 text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-primary focus-visible:border-primary"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    persistTitle(renameValue);
                    setRenameOpen(false);
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
                  onClick={() => setRenameOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    persistTitle(renameValue);
                    setRenameOpen(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Draggable>
  );
}
