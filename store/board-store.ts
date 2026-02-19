"use client";

import { create } from "zustand";
import type { Json } from "@/types/database";
import type {
  BlockColor,
  BlockDto,
  BlockType
} from "@/services/blocks";
import type { BoardDto } from "@/services/boards";

export interface BoardState {
  currentBoard: BoardDto | null;
  blocks: BlockDto[];
  deletedBlockIds: string[];
  selectedBlockId: string | null;
  dragState: {
    blockId: string;
    parentBlockId: string | null;
    centerX: number;
    centerY: number;
    width: number;
    height: number;
  } | null;
  hasUnsavedChanges: boolean;
  setInitialData: (board: BoardDto, blocks: BlockDto[]) => void;
  setSelectedBlock: (id: string | null) => void;
  setDragState: (next: BoardState["dragState"]) => void;
  createBlock: (input: {
    type: BlockType;
    parentBlockId?: string | null;
    x: number;
    y: number;
  }) => Promise<void>;
  updateBlockPositionAndSize: (input: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => Promise<void>;
  updateBlockContent: (input: { id: string; content: Json }) => Promise<void>;
  changeBlockColor: (input: { id: string; color: BlockColor }) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  bringToFront: (id: string) => Promise<void>;
  moveBlockToFolder: (input: {
    blockId: string;
    folderId: string | null;
    x?: number;
    y?: number;
  }) => Promise<void>;
  saveAllChanges: () => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  blocks: [],
  deletedBlockIds: [],
  selectedBlockId: null,
  dragState: null,
  hasUnsavedChanges: false,
  setInitialData: (board, blocks) => {
    console.log("[Store] setInitialData", { boardId: board.id, blocksCount: blocks.length });
    set({
      currentBoard: board,
      blocks,
      deletedBlockIds: [],
      hasUnsavedChanges: false
    });
    console.log("[Store] setInitialData - completed", { boardId: board.id });
  },
  setSelectedBlock: (id) =>
    set({
      selectedBlockId: id
    }),
  setDragState: (next) => set({ dragState: next }),
  createBlock: async ({ type, parentBlockId = null, x, y }) => {
    console.log("[Store] createBlock - start", { type, parentBlockId, x, y });
    const { currentBoard, blocks } = get();
    if (!currentBoard) {
      console.log("[Store] createBlock - no current board, aborting");
      return;
    }

    const GRID_SIZE = 20;
    const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

    const width = snapToGrid(260);
    const height = snapToGrid(160);

    // New blocks should appear above others
    const maxZ = blocks.reduce(
      (acc, block) => (block.zIndex > acc ? block.zIndex : acc),
      0
    );
    const nextZ = maxZ + 1;

    const payload = {
      boardId: currentBoard.id,
      parentBlockId,
      type,
      x,
      y,
      width,
      height,
      color: "dark" as BlockColor,
      content: {} as Json,
      zIndex: nextZ
    };

    console.log("[Store] createBlock - sending request", payload);
    const response = await fetch("/api/blocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("[Store] createBlock - request failed", { status: response.status, statusText: response.statusText });
      return;
    }

    const created = (await response.json()) as BlockDto;
    console.log("[Store] createBlock - block created", { blockId: created.id, type: created.type, zIndex: created.zIndex });

    const withZ: BlockDto = {
      ...created,
      zIndex: created.zIndex ?? nextZ
    };

    set({
      blocks: [...blocks, withZ],
      hasUnsavedChanges: true
    });
    console.log("[Store] createBlock - state updated", { totalBlocks: blocks.length + 1, zIndex: withZ.zIndex });
  },
  updateBlockPositionAndSize: async ({ id, x, y, width, height }) => {
    console.log("[Store] updateBlockPositionAndSize - start", { id, x, y, width, height });
    const { blocks } = get();
    const oldBlock = blocks.find((b) => b.id === id);
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, x, y, width, height } : block
      ),
      hasUnsavedChanges: true
    });
    console.log("[Store] updateBlockPositionAndSize - state updated", { 
      id, 
      oldPos: oldBlock ? { x: oldBlock.x, y: oldBlock.y } : null,
      newPos: { x, y },
      oldSize: oldBlock ? { width: oldBlock.width, height: oldBlock.height } : null,
      newSize: { width, height }
    });
  },
  updateBlockContent: async ({ id, content }) => {
    console.log("[Store] updateBlockContent - start", { id, content });
    const { blocks } = get();
    const oldBlock = blocks.find((b) => b.id === id);
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      ),
      hasUnsavedChanges: true
    });
    console.log("[Store] updateBlockContent - state updated", { 
      id, 
      oldContent: oldBlock?.content,
      newContent: content
    });
  },
  changeBlockColor: async ({ id, color }) => {
    console.log("[Store] changeBlockColor - start", { id, color });
    const { blocks } = get();
    const oldBlock = blocks.find((b) => b.id === id);
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, color } : block
      ),
      hasUnsavedChanges: true
    });
    console.log("[Store] changeBlockColor - state updated", { id, oldColor: oldBlock?.color, newColor: color });
  },
  deleteBlock: async (id) => {
    console.log("[Store] deleteBlock - start", { id });
    const { blocks, selectedBlockId, deletedBlockIds } = get();
    const blockToDelete = blocks.find((b) => b.id === id);
    
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.filter((block) => block.id !== id),
      deletedBlockIds: [...deletedBlockIds, id],
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId,
      hasUnsavedChanges: true
    });
    console.log("[Store] deleteBlock - local state updated", { id, blockToDelete });
  },
  bringToFront: async (id) => {
    console.log("[Store] bringToFront - start", { id });
    const { blocks } = get();
    const previousBlocks = blocks;
    const oldBlock = blocks.find((b) => b.id === id);
    const maxZ = blocks.reduce(
      (acc, block) => (block.zIndex > acc ? block.zIndex : acc),
      0
    );
    const nextZ = maxZ + 1;
    console.log("[Store] bringToFront - calculated z-index", { id, oldZ: oldBlock?.zIndex, newZ: nextZ, maxZ });

    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, zIndex: nextZ } : block
      ),
      hasUnsavedChanges: true
    });
    console.log("[Store] bringToFront - optimistic update applied", { id, zIndex: nextZ });

    const response = await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ zIndex: nextZ })
    });

    if (!response.ok) {
      console.error("[Store] bringToFront - request failed", { id, status: response.status, statusText: response.statusText });
      // Revert optimistic update on error
      set({ blocks: previousBlocks });
      console.log("[Store] bringToFront - reverted optimistic update", { id });
    } else {
      console.log("[Store] bringToFront - completed successfully", { id, zIndex: nextZ });
    }
  },
  moveBlockToFolder: async ({ blockId, folderId, x, y }) => {
    console.log("[Store] moveBlockToFolder - start", { blockId, folderId, x, y });
    const { blocks } = get();
    const oldBlock = blocks.find((b) => b.id === blockId);
    
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              parentBlockId: folderId,
              ...(x !== undefined ? { x } : null),
              ...(y !== undefined ? { y } : null)
            }
          : block
      ),
      hasUnsavedChanges: true
    });
    console.log("[Store] moveBlockToFolder - state updated", { 
      blockId, 
      folderId, 
      oldParent: oldBlock?.parentBlockId,
      newParent: folderId,
      oldPos: oldBlock ? { x: oldBlock.x, y: oldBlock.y } : null,
      newPos: { x, y }
    });
  },
  saveAllChanges: async () => {
    const { blocks, deletedBlockIds } = get();
    console.log("[Store] saveAllChanges - start", { blocksCount: blocks.length, deletedCount: deletedBlockIds.length });
    const errors: string[] = [];

    // Delete all blocks that have been marked for deletion
    await Promise.all(
      deletedBlockIds.map(async (id) => {
        try {
          console.log("[Store] saveAllChanges - deleting block", { blockId: id });
          const response = await fetch(`/api/blocks/${id}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            console.error("[Store] saveAllChanges - block delete failed", { blockId: id, status: response.status });
            errors.push(`Failed to delete block ${id}`);
          } else {
            console.log("[Store] saveAllChanges - block deleted", { blockId: id });
          }
        } catch (error) {
          console.error("[Store] saveAllChanges - block delete error", { blockId: id, error });
          errors.push(`Error deleting block ${id}: ${error}`);
        }
      })
    );

    // Save all blocks that have been modified
    await Promise.all(
      blocks.map(async (block) => {
        try {
          console.log("[Store] saveAllChanges - saving block", { blockId: block.id });
          const response = await fetch(`/api/blocks/${block.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              x: block.x,
              y: block.y,
              width: block.width,
              height: block.height,
              color: block.color,
              content: block.content,
              zIndex: block.zIndex,
              parentBlockId: block.parentBlockId
            })
          });

          if (!response.ok) {
            console.error("[Store] saveAllChanges - block save failed", { blockId: block.id, status: response.status });
            errors.push(`Failed to save block ${block.id}`);
          } else {
            console.log("[Store] saveAllChanges - block saved", { blockId: block.id });
          }
        } catch (error) {
          console.error("[Store] saveAllChanges - block save error", { blockId: block.id, error });
          errors.push(`Error saving block ${block.id}: ${error}`);
        }
      })
    );

    if (errors.length > 0) {
      console.error("[Store] saveAllChanges - some operations failed", { errors, totalBlocks: blocks.length, deletedCount: deletedBlockIds.length, failedCount: errors.length });
      throw new Error("Failed to save some changes");
    } else {
      console.log("[Store] saveAllChanges - all operations completed successfully", { blocksCount: blocks.length, deletedCount: deletedBlockIds.length });
      set({ hasUnsavedChanges: false, deletedBlockIds: [] });
      console.log("[Store] saveAllChanges - hasUnsavedChanges set to false, deletedBlockIds cleared");
    }
  }
}));

