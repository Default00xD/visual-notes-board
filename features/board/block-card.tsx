"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import Draggable, {
  type DraggableData,
  type DraggableEvent
} from "react-draggable";
import { Resizable, type ResizeCallback } from "re-resizable";
import { motion, AnimatePresence } from "framer-motion";
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

const GRID_SIZE = 20;

// Snap value to nearest multiple of grid size
const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

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
  const [snapPos, setSnapPos] = useState<{ x: number; y: number } | null>(null);
  const [snapSize, setSnapSize] = useState<{ width: number; height: number } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const nodeRef = useRef(null);

  const title = useMemo(() => {
    const content = block.content as { title?: string } | null;
    return content?.title?.trim() ?? "";
  }, [block.content]);

  useEffect(() => {
    // Keep local position in sync with store when not actively dragging/resizing.
    if (!isDragging && !isResizing && !snapPos) {
      setPos({ x: block.x, y: block.y });
    }
  }, [block.x, block.y, isDragging, isResizing, snapPos]);

  // Animate to snapped position
  useEffect(() => {
    if (snapPos) {
      setPos(snapPos);
      const timer = setTimeout(() => {
        setSnapPos(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [snapPos]);

  // Animate to snapped size
  useEffect(() => {
    if (snapSize) {
      const timer = setTimeout(() => {
        setSnapSize(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [snapSize]);

  const handleStopDrag = (_event: DraggableEvent, data: DraggableData) => {
    console.log("[BlockCard] Drag stop - start", { blockId: block.id, data });
    setIsDragging(false);

    const nextX = snapToGrid(data.x);
    const nextY = snapToGrid(data.y);
    console.log("[BlockCard] Drag stop - snapped position", { blockId: block.id, nextX, nextY, originalX: data.x, originalY: data.y });

    // Show preview of snapped position
    setSnapPos({ x: nextX, y: nextY });

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
      console.log("[BlockCard] Drag stop - moving to folder", { blockId: block.id, folderId: targetFolder.id });
      // Snap into the folder canvas with a reasonable default position.
      void moveBlockToFolder({
        blockId: block.id,
        folderId: targetFolder.id,
        x: snapToGrid(80),
        y: snapToGrid(80)
      }).then(() => {
        console.log("[BlockCard] Drag stop - moved to folder successfully", { blockId: block.id, folderId: targetFolder.id });
      }).catch((error) => {
        console.error("[BlockCard] Drag stop - failed to move to folder", { blockId: block.id, folderId: targetFolder.id, error });
      });
      return;
    }

    console.log("[BlockCard] Drag stop - updating position", { blockId: block.id, x: nextX, y: nextY });
    // Only update local state, don't save to server yet
    void updateBlockPositionAndSize({
      id: block.id,
      x: nextX,
      y: nextY,
      width: block.width,
      height: block.height
    });
    console.log("[BlockCard] Drag stop - position updated", { blockId: block.id, x: nextX, y: nextY });
  };

  const handleStartDrag = () => {
    console.log("[BlockCard] Drag start", { blockId: block.id, currentPos: { x: block.x, y: block.y } });
    setIsDragging(true);
    setSelectedBlock(block.id);
    void bringToFront(block.id).then(() => {
      console.log("[BlockCard] Drag start - brought to front", { blockId: block.id });
    }).catch((error) => {
      console.error("[BlockCard] Drag start - failed to bring to front", { blockId: block.id, error });
    });
  };

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    setPos({ x: data.x, y: data.y });
  };

  const handleResizeStop: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    console.log("[BlockCard] Resize stop - start", { blockId: block.id, direction: _direction, currentSize: { width: ref.offsetWidth, height: ref.offsetHeight } });
    setIsResizing(false);
    const width = snapToGrid(ref.offsetWidth);
    const height = snapToGrid(ref.offsetHeight);
    console.log("[BlockCard] Resize stop - snapped size", { blockId: block.id, width, height, originalWidth: ref.offsetWidth, originalHeight: ref.offsetHeight });
    
    // Show preview of snapped size
    setSnapSize({ width, height });

    console.log("[BlockCard] Resize stop - updating size", { blockId: block.id, width, height });
    // Only update local state, don't save to server yet
    void updateBlockPositionAndSize({
      id: block.id,
      x: block.x,
      y: block.y,
      width,
      height
    });
    console.log("[BlockCard] Resize stop - size updated", { blockId: block.id, width, height });
  };

  const handleResizeStart = () => {
    console.log("[BlockCard] Resize start", { blockId: block.id, currentSize: { width: block.width, height: block.height } });
    setIsResizing(true);
  };

  const persistTitle = (nextTitle: string) => {
    console.log("[BlockCard] Persist title - start", { blockId: block.id, newTitle: nextTitle, oldTitle: title });
    const content = (block.content as Record<string, Json>) ?? {};
    // Only update local state, don't save to server yet
    void updateBlockContent({
      id: block.id,
      content: {
        ...content,
        title: nextTitle.trim() || undefined
      }
    });
    console.log("[BlockCard] Persist title - updated", { blockId: block.id, title: nextTitle.trim() || undefined });
  };

  const colorClass = COLOR_MAP[block.color] ?? COLOR_MAP.slate;
  const colorDotClass = COLOR_DOT_MAP[block.color] ?? COLOR_DOT_MAP.slate;
  const isSelected = selectedBlockId === block.id;

  const displayWidth = snapSize?.width ?? block.width;
  const displayHeight = snapSize?.height ?? block.height;

  return (
    <Draggable
      nodeRef={nodeRef}
      position={snapPos ?? pos}
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
          whileHover={!isDragging && !isResizing ? { scale: 1 } : {}}
          transition={{ duration: 0.18 }}
        >
          <Resizable
            size={{
              width: displayWidth,
              height: displayHeight
            }}
            minWidth={snapToGrid(200)}
            minHeight={snapToGrid(150)}
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
            style={{
              transition: snapSize ? "width 0.3s ease-out, height 0.3s ease-out" : undefined
            }}
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

                <div className="flex items-center gap-1 flex-shrink-0">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="h-5 w-5 rounded-full border border-neutral-700/50 shadow-sm transition-all hover:border-primary/50"
                        style={{ backgroundColor: "transparent" }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className={`block h-full w-full rounded-full ${colorDotClass}`}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      className="w-auto space-y-2 bg-neutral-900 border-neutral-800 z-[100]"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="text-[11px] font-medium text-neutral-300">
                        Block color
                      </div>
                      <div className="flex gap-2">
                        {(
                          ["slate", "amber", "emerald", "sky", "violet", "rose"] as BlockColor[]
                        ).map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              console.log("[BlockCard] Color change - start", { blockId: block.id, newColor: color, oldColor: block.color });
                              void changeBlockColor({ id: block.id, color }).then(() => {
                                console.log("[BlockCard] Color change - completed", { blockId: block.id, color });
                              }).catch((error) => {
                                console.error("[BlockCard] Color change - failed", { blockId: block.id, color, error });
                              });
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
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-neutral-200 hover:bg-neutral-800/50"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-neutral-900 border-neutral-800 z-[100]"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          console.log("[BlockCard] Rename menu item clicked", { blockId: block.id, currentTitle: title });
                          e.stopPropagation();
                          setRenameValue(title);
                          setRenameOpen(true);
                          console.log("[BlockCard] Rename dialog opened", { blockId: block.id });
                        }}
                        className="text-neutral-300 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white"
                      >
                        Rename…
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          console.log("[BlockCard] Delete menu item clicked", { blockId: block.id });
                          e.stopPropagation();
                          void deleteBlock(block.id).then(() => {
                            console.log("[BlockCard] Delete completed", { blockId: block.id });
                          }).catch((error) => {
                            console.error("[BlockCard] Delete failed", { blockId: block.id, error });
                          });
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
                    console.log("[BlockCard] Rename dialog - Enter pressed", { blockId: block.id, newTitle: renameValue });
                    persistTitle(renameValue);
                    setRenameOpen(false);
                    console.log("[BlockCard] Rename dialog - closed via Enter", { blockId: block.id });
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-neutral-800/50 bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50 hover:text-white"
                  onClick={() => {
                    console.log("[BlockCard] Rename dialog - Cancel clicked", { blockId: block.id });
                    setRenameOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    console.log("[BlockCard] Rename dialog - Save clicked", { blockId: block.id, newTitle: renameValue });
                    persistTitle(renameValue);
                    setRenameOpen(false);
                    console.log("[BlockCard] Rename dialog - closed via Save", { blockId: block.id });
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
