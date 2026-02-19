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
  selectedBlockId: string | null;
  openFolderId: string | null;
  setInitialData: (board: BoardDto, blocks: BlockDto[]) => void;
  setSelectedBlock: (id: string | null) => void;
  setOpenFolderId: (id: string | null) => void;
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
  selectedBlockId: null,
  openFolderId: null,
  setInitialData: (board, blocks) =>
    set({
      currentBoard: board,
      blocks
    }),
  setSelectedBlock: (id) =>
    set({
      selectedBlockId: id
    }),
  setOpenFolderId: (id) =>
    set({
      openFolderId: id
    }),
  createBlock: async ({ type, parentBlockId = null, x, y }) => {
    const { currentBoard, blocks } = get();
    if (!currentBoard) return;

    const GRID_SIZE = 20;
    const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
    
    const width = snapToGrid(260);
    const height = snapToGrid(160);

    const payload = {
      boardId: currentBoard.id,
      parentBlockId,
      type,
      x,
      y,
      width,
      height,
      color: "slate" as BlockColor,
      content: {} as Json
    };

    const response = await fetch("/api/blocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // In production you can show toast
      // eslint-disable-next-line no-console
      console.error("Failed to create block");
      return;
    }

    const created = (await response.json()) as BlockDto;

    set({
      blocks: [...blocks, created]
    });
  },
  updateBlockPositionAndSize: async ({ id, x, y, width, height }) => {
    const { blocks } = get();
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, x, y, width, height } : block
      )
    });
  },
  updateBlockContent: async ({ id, content }) => {
    const { blocks } = get();
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    });
  },
  changeBlockColor: async ({ id, color }) => {
    const { blocks } = get();
    // Only update local state, don't save to server yet
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, color } : block
      )
    });
  },
  deleteBlock: async (id) => {
    const { blocks, selectedBlockId } = get();
    const previousBlocks = blocks;
    const previousSelected = selectedBlockId;
    set({
      blocks: blocks.filter((block) => block.id !== id),
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId
    });

    const response = await fetch(`/api/blocks/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      // Revert optimistic update on error
      set({
        blocks: previousBlocks,
        selectedBlockId: previousSelected
      });
      // eslint-disable-next-line no-console
      console.error("Failed to delete block");
    }
  },
  bringToFront: async (id) => {
    const { blocks } = get();
    const previousBlocks = blocks;
    const maxZ = blocks.reduce(
      (acc, block) => (block.zIndex > acc ? block.zIndex : acc),
      0
    );
    const nextZ = maxZ + 1;

    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, zIndex: nextZ } : block
      )
    });

    const response = await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ zIndex: nextZ })
    });

    if (!response.ok) {
      // Revert optimistic update on error
      set({ blocks: previousBlocks });
      // eslint-disable-next-line no-console
      console.error("Failed to bring block to front");
    }
  },
  moveBlockToFolder: async ({ blockId, folderId, x, y }) => {
    const { blocks } = get();
    const previousBlocks = blocks;
    
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
      )
    });

    const response = await fetch(`/api/blocks/${blockId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parentBlockId: folderId,
        ...(x !== undefined ? { x } : null),
        ...(y !== undefined ? { y } : null)
      })
    });

    if (!response.ok) {
      // Revert optimistic update on error
      set({ blocks: previousBlocks });
      // eslint-disable-next-line no-console
      console.error("Failed to move block to folder");
    }
  },
  saveAllChanges: async () => {
    const { blocks } = get();
    const errors: string[] = [];

    // Save all blocks that have been modified
    await Promise.all(
      blocks.map(async (block) => {
        try {
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
            errors.push(`Failed to save block ${block.id}`);
          }
        } catch (error) {
          errors.push(`Error saving block ${block.id}: ${error}`);
        }
      })
    );

    if (errors.length > 0) {
      // eslint-disable-next-line no-console
      console.error("Some blocks failed to save:", errors);
      throw new Error("Failed to save some changes");
    }
  }
}));

