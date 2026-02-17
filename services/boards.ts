import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface BoardDto {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export async function getOrCreateDefaultBoard(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BoardDto> {
  const { data: existingBoards, error: selectError } = await supabase
    .from("boards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (selectError) {
    throw new Error(selectError.message);
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

  const { data: inserted, error: insertError } = await supabase
    .from("boards")
    .insert({
      title: "My Visual Board",
      user_id: userId
    })
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? "Failed to create default board");
  }

  return {
    id: inserted.id,
    userId: inserted.user_id,
    title: inserted.title,
    createdAt: inserted.created_at
  };
}

export async function getBoardsForUser(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BoardDto[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
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

