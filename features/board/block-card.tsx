"use client";

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

interface BlockCardProps {
  block: BlockDto;
}

const COLOR_MAP: Record<BlockColor, string> = {
  slate: "bg-slate-50 border-slate-200",
  amber: "bg-amber-50 border-amber-200",
  emerald: "bg-emerald-50 border-emerald-200",
  sky: "bg-sky-50 border-sky-200",
  violet: "bg-violet-50 border-violet-200",
  rose: "bg-rose-50 border-rose-200"
};

export function BlockCard({ block }: BlockCardProps) {
  const {
    selectedBlockId,
    setSelectedBlock,
    updateBlockPositionAndSize,
    changeBlockColor,
    deleteBlock,
    bringToFront
  } = useBoardStore();

  const handleStopDrag = (_event: DraggableEvent, data: DraggableData) => {
    void updateBlockPositionAndSize({
      id: block.id,
      x: data.x,
      y: data.y,
      width: block.width,
      height: block.height
    });
  };

  const handleResizeStop: ResizeCallback = (
    _event,
    _direction,
    ref
  ) => {
    const width = ref.offsetWidth;
    const height = ref.offsetHeight;
    void updateBlockPositionAndSize({
      id: block.id,
      x: block.x,
      y: block.y,
      width,
      height
    });
  };

  const colorClass = COLOR_MAP[block.color] ?? COLOR_MAP.slate;
  const isSelected = selectedBlockId === block.id;

  return (
    <Draggable
      bounds="parent"
      defaultPosition={{ x: block.x, y: block.y }}
      onStart={() => {
        setSelectedBlock(block.id);
        void bringToFront(block.id);
      }}
      onStop={handleStopDrag}
    >
      <motion.div
        style={{
          position: "absolute",
          zIndex: block.zIndex
        }}
      >
        <Resizable
          defaultSize={{
            width: block.width,
            height: block.height
          }}
          minWidth={180}
          minHeight={120}
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
          onResizeStop={handleResizeStop}
          className={`group flex flex-col rounded-xl border shadow-sm backdrop-blur ${colorClass} ${
            isSelected ? "ring-2 ring-sky-400" : "ring-0"
          }`}
        >
          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-500">
            <span className="truncate capitalize">{block.type}</span>
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="h-4 w-4 rounded-full border border-white/60 shadow-sm transition hover:scale-110"
                    style={{ backgroundColor: "transparent" }}
                  >
                    <span
                      className="block h-full w-full rounded-full border border-white/60"
                      data-color={block.color}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto space-y-1">
                  <div className="text-[11px] font-medium text-slate-500">
                    Block color
                  </div>
                  <div className="flex gap-1.5">
                    {(["slate", "amber", "emerald", "sky", "violet", "rose"] as BlockColor[]).map(
                      (color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            void changeBlockColor({ id: block.id, color });
                          }}
                          className={`h-5 w-5 rounded-full border border-white/70 shadow-sm transition hover:scale-110 ${
                            color === "slate" && "bg-slate-300"
                          } ${color === "amber" && "bg-amber-300"} ${
                            color === "emerald" && "bg-emerald-300"
                          } ${color === "sky" && "bg-sky-300"} ${
                            color === "violet" && "bg-violet-300"
                          } ${color === "rose" && "bg-rose-300"}`}
                        />
                      )
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      void deleteBlock(block.id);
                    }}
                  >
                    Delete block
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex-1 px-3 pb-3 pt-1 text-xs">
            <BlockRenderer block={block} />
          </div>
        </Resizable>
      </motion.div>
    </Draggable>
  );
}

