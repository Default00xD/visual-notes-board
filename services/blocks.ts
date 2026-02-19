import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export type BlockType =
  | "text"
  | "image"
  | "checklist"
  | "likes"
  | "list"
  | "folder";

export type BlockColor =
  | "dark"
  | "slate"
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "rose";

export interface BlockDto {
  id: string;
  boardId: string;
  parentBlockId: string | null;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: BlockColor;
  content: Json;
  zIndex: number;
  createdAt: string;
}

export async function getBlocksForBoard(
  supabase: SupabaseServerClient,
  boardId: string
): Promise<BlockDto[]> {
  const { data, error } = await (supabase
    .from("blocks") as any)
    .select("*")
    .eq("board_id", boardId)
    .order("z_index", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((block: Database["public"]["Tables"]["blocks"]["Row"]) => ({
      id: block.id,
      boardId: block.board_id,
      parentBlockId: block.parent_block_id,
      type: block.type,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      color: (block.color as BlockColor) ?? "dark",
      content: block.content,
      zIndex: block.z_index,
      createdAt: block.created_at
    })) ?? []
  );
}

export interface CreateBlockInput {
  boardId: string;
  parentBlockId?: string | null;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: BlockColor;
  content?: Json;
  zIndex?: number;
}

export async function createBlock(
  supabase: SupabaseServerClient,
  payload: CreateBlockInput
): Promise<BlockDto> {
  const { data, error } = (await (supabase
    .from("blocks") as any)
    .insert({
      board_id: payload.boardId,
      parent_block_id: payload.parentBlockId ?? null,
      type: payload.type,
      x: payload.x,
      y: payload.y,
      width: payload.width,
      height: payload.height,
      color: payload.color,
      content: payload.content ?? {},
      z_index: payload.zIndex ?? 0
    })
    .select("*")
    .single()) as { data: any; error: any };

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create block");
  }

  return {
    id: data.id,
    boardId: data.board_id,
    parentBlockId: data.parent_block_id,
    type: data.type,
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    color: data.color as BlockColor,
    content: data.content,
    zIndex: data.z_index,
    createdAt: data.created_at
  };
}

export interface UpdateBlockInput {
  id: string;
  fields: Partial<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: BlockColor;
    content: Json;
    zIndex: number;
    parentBlockId: string | null;
  }>;
}

export async function updateBlock(
  supabase: SupabaseServerClient,
  payload: UpdateBlockInput
): Promise<BlockDto> {
  const updatePayload: Database["public"]["Tables"]["blocks"]["Update"] = {};

  if (payload.fields.x !== undefined) {
    updatePayload.x = payload.fields.x;
  }
  if (payload.fields.y !== undefined) {
    updatePayload.y = payload.fields.y;
  }
  if (payload.fields.width !== undefined) {
    updatePayload.width = payload.fields.width;
  }
  if (payload.fields.height !== undefined) {
    updatePayload.height = payload.fields.height;
  }
  if (payload.fields.color !== undefined) {
    updatePayload.color = payload.fields.color;
  }
  if (payload.fields.content !== undefined) {
    updatePayload.content = payload.fields.content;
  }
  if (payload.fields.zIndex !== undefined) {
    updatePayload.z_index = payload.fields.zIndex;
  }
  if (payload.fields.parentBlockId !== undefined) {
    updatePayload.parent_block_id = payload.fields.parentBlockId;
  }

  const { data, error } = (await (supabase
    .from("blocks") as any)
    .update(updatePayload)
    .eq("id", payload.id)
    .select("*")
    .single()) as { data: any; error: any };

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update block");
  }

  return {
    id: data.id,
    boardId: data.board_id,
    parentBlockId: data.parent_block_id,
    type: data.type,
    x: data.x,
    y: data.y,
    width: data.width,
    height: data.height,
    color: data.color as BlockColor,
    content: data.content,
    zIndex: data.z_index,
    createdAt: data.created_at
  };
}

export async function deleteBlock(
  supabase: SupabaseServerClient,
  id: string
): Promise<void> {
  const { error } = await (supabase
    .from("blocks") as any)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

