import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;

export interface BoardDto {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export async function getOrCreateDefaultBoard(
  supabase: SupabaseServerClient,
  userId: string
): Promise<BoardDto> {
  const { data: existingBoards, error: selectError } = (await (supabase
    .from("boards") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)) as {
    data: Database["public"]["Tables"]["boards"]["Row"][] | null;
    error: unknown;
  };

  if (selectError) {
    throw new Error((selectError as { message?: string }).message ?? "Failed to load boards");
  }

  if (existingBoards && existingBoards.length > 0) {
    const board = existingBoards[0];
    return {
      id: board.id,
      userId: board.user_id,
      title: board.title,
      createdAt: board.created_at
    };
  }

  const { data: inserted, error: insertError } = (await (supabase
    .from("boards") as any)
    .insert({
      title: "My Visual Board",
      user_id: userId
    })
    .select("*")
    .single()) as {
    data: Database["public"]["Tables"]["boards"]["Row"] | null;
    error: unknown;
  };

  if (insertError || !inserted) {
    throw new Error(
      (insertError as { message?: string })?.message ?? "Failed to create default board"
    );
  }

  return {
    id: inserted.id,
    userId: inserted.user_id,
    title: inserted.title,
    createdAt: inserted.created_at
  };
}

export async function getBoardsForUser(
  supabase: SupabaseServerClient,
  userId: string
): Promise<BoardDto[]> {
  const { data, error } = (await (supabase
    .from("boards") as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })) as {
    data: Database["public"]["Tables"]["boards"]["Row"][] | null;
    error: unknown;
  };

  if (error) {
    throw new Error((error as { message?: string }).message ?? "Failed to load boards");
  }

  return (
    data?.map((board) => ({
      id: board.id,
      userId: board.user_id,
      title: board.title,
      createdAt: board.created_at
    })) ?? []
  );
}

