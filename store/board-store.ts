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

    const width = 260;
    const height = 160;

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
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, x, y, width, height } : block
      )
    });

    await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ x, y, width, height })
    });
  },
  updateBlockContent: async ({ id, content }) => {
    const { blocks } = get();
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, content } : block
      )
    });

    await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content })
    });
  },
  changeBlockColor: async ({ id, color }) => {
    const { blocks } = get();
    set({
      blocks: blocks.map((block) =>
        block.id === id ? { ...block, color } : block
      )
    });

    await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ color })
    });
  },
  deleteBlock: async (id) => {
    const { blocks, selectedBlockId } = get();
    set({
      blocks: blocks.filter((block) => block.id !== id),
      selectedBlockId: selectedBlockId === id ? null : selectedBlockId
    });

    await fetch(`/api/blocks/${id}`, {
      method: "DELETE"
    });
  },
  bringToFront: async (id) => {
    const { blocks } = get();
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

    await fetch(`/api/blocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ zIndex: nextZ })
    });
  }
}));

