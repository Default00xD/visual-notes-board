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
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Json } from "@/types/database";
import { Input } from "@/components/ui/input";
import { BlockRenderer } from "@/features/board/block-renderer";
import { ImageBlock, type ImageBlockHandle } from "@/features/board/blocks/image-block";

interface BlockCardProps {
  block: BlockDto;
}

const GRID_SIZE = 50;

// Snap value to nearest multiple of half grid size
const snapToGrid = (value: number): number => {
  return Math.round(value / (GRID_SIZE / 2)) * (GRID_SIZE / 2);
};

const COLOR_MAP: Record<BlockColor, string> = {
  dark: "bg-neutral-900/90 border-neutral-800/70",
  slate: "bg-slate-800/90 border-slate-700/50",
  amber: "bg-amber-900/40 border-amber-700/50",
  emerald: "bg-emerald-900/40 border-emerald-700/50",
  sky: "bg-sky-900/40 border-sky-700/50",
  violet: "bg-violet-900/40 border-violet-700/50",
  rose: "bg-rose-900/40 border-rose-700/50"
};

const COLOR_DOT_MAP: Record<BlockColor, string> = {
  dark: "bg-neutral-700",
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
    blocks,
    setDragState
  } = useBoardStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number }>({
    x: block.x,
    y: block.y
  });
  const [snapPos, setSnapPos] = useState<{ x: number; y: number } | null>(null);
  const [snapSize, setSnapSize] = useState<{ width: number; height: number } | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const nodeRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<ImageBlockHandle | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

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

  // Animate to snapped position smoothly
  useEffect(() => {
    if (snapPos) {
      // Update position with smooth transition
      setPos(snapPos);
      // Clear snapPos after animation completes
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
    setDragState(null);
    setPreviewPos(null);

    // Constrain to canvas bounds
    const canvasElement = nodeRef.current?.closest('.relative.h-full') as HTMLElement | null;
    const canvas = canvasElement?.getBoundingClientRect();
    const maxX = canvas ? canvas.width - block.width : window.innerWidth - block.width;
    const maxY = canvas ? canvas.height - block.height : window.innerHeight - block.height;
    
    let nextX = snapToGrid(Math.max(0, Math.min(data.x, maxX)));
    let nextY = snapToGrid(Math.max(0, Math.min(data.y, maxY)));
    
    // Ensure snapped values are within bounds
    nextX = Math.max(0, Math.min(nextX, maxX));
    nextY = Math.max(0, Math.min(nextY, maxY));
    
    console.log("[BlockCard] Drag stop - snapped position", { blockId: block.id, nextX, nextY, originalX: data.x, originalY: data.y });

    // Animate to snapped position smoothly
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
    // Prevent dragging when resizing
    if (isResizing) {
      return;
    }
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
    // Show preview of snapped position
    const previewX = snapToGrid(data.x);
    const previewY = snapToGrid(data.y);
    setPreviewPos({ x: previewX, y: previewY });
    setDragState({
      blockId: block.id,
      parentBlockId: block.parentBlockId,
      centerX: data.x + block.width / 2,
      centerY: data.y + block.height / 2,
      width: block.width,
      height: block.height
    });
  };

  const handleResize: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    if (!isResizing) return;
    // Show preview of snapped size during resize
    const previewWidth = snapToGrid(ref.offsetWidth);
    const previewHeight = snapToGrid(ref.offsetHeight);
    setPreviewSize({ width: previewWidth, height: previewHeight });
  };

  const handleResizeStop: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    console.log("[BlockCard] Resize stop - start", { blockId: block.id, direction: _direction, currentSize: { width: ref.offsetWidth, height: ref.offsetHeight } });
    setIsResizing(false);
    setPreviewSize(null);
    
    // Constrain to canvas bounds and snap
    const canvasElement = nodeRef.current?.closest('.relative.h-full') as HTMLElement | null;
    const canvas = canvasElement?.getBoundingClientRect();
    const currentX = snapPos?.x ?? pos.x;
    const currentY = snapPos?.y ?? pos.y;
    const maxWidth = canvas ? Math.max(snapToGrid(200), canvas.width - currentX) : Math.max(snapToGrid(200), window.innerWidth - currentX);
    const maxHeight = canvas ? Math.max(snapToGrid(150), canvas.height - currentY) : Math.max(snapToGrid(150), window.innerHeight - currentY);
    
    let width = snapToGrid(Math.max(snapToGrid(200), Math.min(ref.offsetWidth, maxWidth)));
    let height = snapToGrid(Math.max(snapToGrid(150), Math.min(ref.offsetHeight, maxHeight)));
    
    // For image blocks, maintain aspect ratio
    if (isImage && aspectRatio) {
      const snappedByWidth = height;
      const snappedByHeight = width;
      if (snappedByWidth / snappedByHeight > aspectRatio) {
        height = snapToGrid(snappedByWidth / aspectRatio);
      } else {
        width = snapToGrid(snappedByHeight * aspectRatio);
      }
    }
    
    console.log("[BlockCard] Resize stop - snapped size", { blockId: block.id, width, height, originalWidth: ref.offsetWidth, originalHeight: ref.offsetHeight });
    
    // Show preview of snapped size
    setSnapSize({ width, height });

    console.log("[BlockCard] Resize stop - updating size", { blockId: block.id, width, height });
    // Only update local state, don't save to server yet
    const currentPos = snapPos ?? pos;
    void updateBlockPositionAndSize({
      id: block.id,
      x: currentPos.x,
      y: currentPos.y,
      width,
      height
    });
    console.log("[BlockCard] Resize stop - size updated", { blockId: block.id, width, height });
  };

  const handleResizeStart = () => {
    console.log("[BlockCard] Resize start", { blockId: block.id, currentSize: { width: block.width, height: block.height } });
    setIsResizing(true);
    setIsDragging(false); // Ensure drag is not active during resize
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

  const colorClass = COLOR_MAP[block.color] ?? COLOR_MAP.dark;
  const colorDotClass = COLOR_DOT_MAP[block.color] ?? COLOR_DOT_MAP.dark;
  const isSelected = selectedBlockId === block.id;
  const isImage = block.type === "image";

  const aspectRatio = useMemo(() => {
    if (block.type !== "image") return null;
    const content = block.content as { aspectRatio?: number } | null;
    const ratio = content?.aspectRatio;
    return typeof ratio === "number" && ratio > 0 ? ratio : null;
  }, [block.type, block.content]);

  const displayWidth = snapSize?.width ?? previewSize?.width ?? block.width;
  const displayHeight = snapSize?.height ?? previewSize?.height ?? block.height;

  return (
    <>
      {/* Preview shadow showing final snapped position/size
      {(isDragging || isResizing) && (previewPos || previewSize) && (
        <div
          style={{
            position: "absolute",
            left: previewPos?.x ?? pos.x,
            top: previewPos?.y ?? pos.y,
            width: previewSize?.width ?? block.width,
            height: previewSize?.height ?? block.height,
            zIndex: block.zIndex - 1,
            pointerEvents: "none"
          }}
          className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5"
        />
      )} */}
    <Draggable
      nodeRef={nodeRef}
      position={snapPos ?? pos}
      onStart={handleStartDrag}
      onDrag={handleDrag}
      onStop={handleStopDrag}
      handle={isImage ? undefined : ".drag-handle, .drag-surface"}
      cancel=".no-drag, input, textarea, button"
      disabled={isResizing}
    >
      <div
        ref={nodeRef}
        style={{
          position: "absolute",
          zIndex: block.zIndex
        }}
      >
        {/* motion is INSIDE the draggable node to avoid transform conflicts */}
        <div>
          <Resizable
            size={{
              width: displayWidth,
              height: displayHeight
            }}
            minWidth={snapToGrid(200)}
            minHeight={snapToGrid(150)}
            lockAspectRatio={isImage && aspectRatio ? aspectRatio : undefined}
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
            onResize={handleResize}
            onResizeStop={handleResizeStop}
            style={{
              ...(snapSize
                ? {
                    transition: "width 0.3s ease-out, height 0.3s ease-out"
                  }
                : {}),
              ...(snapPos
                ? {
                    transition: "transform 0.3s ease-out"
                  }
                : {})
            }}
            className={`group flex flex-col rounded-xl border shadow-xl backdrop-blur-sm transition-all duration-200 ${
              isImage ? "bg-transparent border-none shadow-none" : colorClass
            } ${
              isSelected
                ? "ring-0 ring-primary shadow-2xl"
                : "ring-0 hover:ring-1 hover:ring-neutral-700/50"
            } ${isDragging ? "opacity-90" : ""} focus-visible:ring-0`}
          >
            {isImage ? (
              <div className="relative flex h-full w-full overflow-hidden rounded-xl">
                {/* Drag surface under all elements */}
                <div className="drag-surface absolute inset-0 z-0 cursor-move" />
                <div className="relative z-10 h-full w-full">
                  <ImageBlock block={block} ref={imageRef} />
                  <button
                    type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("[BlockCard] Image delete button clicked", { blockId: block.id });
                        void deleteBlock(block.id).catch((error) => {
                          console.error("[BlockCard] Image delete failed", {
                            blockId: block.id,
                            error
                          });
                        });
                      }}
                    className="no-drag absolute right-2 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950/80 text-neutral-300 opacity-0 shadow-lg shadow-black/40 transition-all hover:bg-red-600/90 hover:text-white group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("[BlockCard] Image upload button clicked", { blockId: block.id });
                      imageRef.current?.openFilePicker();
                    }}
                    className="no-drag absolute right-10 top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-950/80 text-neutral-300 opacity-0 shadow-lg shadow-black/40 transition-all hover:bg-neutral-800/90 hover:text-white group-hover:opacity-100"
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header (drag handle) */}
                <div className="drag-handle relative flex items-center justify-between px-3 py-2 border-b border-neutral-800/50 cursor-move select-none">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
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
                        align="start"
                        className="w-auto space-y-2 bg-neutral-900 border-neutral-800 z-[100]"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <div className="text-[11px] font-medium text-neutral-300">
                          Block color
                        </div>
                        <div className="flex gap-2">
                          {(
                            ["dark", "slate", "amber", "emerald", "sky", "violet", "rose"] as BlockColor[]
                          ).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                console.log("[BlockCard] Color change - start", {
                                  blockId: block.id,
                                  newColor: color,
                                  oldColor: block.color
                                });
                                void changeBlockColor({ id: block.id, color })
                                  .then(() => {
                                    console.log("[BlockCard] Color change - completed", {
                                      blockId: block.id,
                                      color
                                    });
                                  })
                                  .catch((error) => {
                                    console.error("[BlockCard] Color change - failed", {
                                      blockId: block.id,
                                      color,
                                      error
                                    });
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

                    <div className="flex-1 min-w-0">
                      {isEditingTitle ? (
                        <Input
                          ref={titleInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="no-drag h-7 border-neutral-800/50 bg-neutral-900/40 px-2 py-1 text-sm text-neutral-100 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-primary/50"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={() => {
                            console.log("[BlockCard] Inline rename blur - saving", { blockId: block.id, newTitle: renameValue });
                            persistTitle(renameValue);
                            setIsEditingTitle(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              console.log("[BlockCard] Inline rename Enter - saving", { blockId: block.id, newTitle: renameValue });
                              persistTitle(renameValue);
                              setIsEditingTitle(false);
                            }
                            if (e.key === "Escape") {
                              console.log("[BlockCard] Inline rename Escape - cancel", { blockId: block.id });
                              setRenameValue(title);
                              setIsEditingTitle(false);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div className="truncate text-sm font-medium text-neutral-200">
                          {title || "Untitled"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="no-drag h-7 w-7 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-neutral-200 hover:bg-neutral-800/50"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("[BlockCard] Inline rename button clicked", { blockId: block.id, currentTitle: title });
                        setRenameValue(title);
                        setIsEditingTitle(true);
                        // Focus after render
                        setTimeout(() => titleInputRef.current?.focus(), 0);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="no-drag h-7 w-7 text-neutral-400 opacity-0 transition-all group-hover:opacity-100 hover:text-white hover:bg-red-600/80"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("[BlockCard] Delete button clicked", { blockId: block.id });
                        void deleteBlock(block.id).catch((error) => {
                          console.error("[BlockCard] Delete failed", { blockId: block.id, error });
                        });
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
              </>
            )}
          </Resizable>
        </div>

      </div>
    </Draggable>
    </>
  );
}
