import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBlock } from "@/services/blocks";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401
      }
    );
  }

  const body = await request.json();
  const {
    boardId,
    parentBlockId,
    type,
    x,
    y,
    width,
    height,
    color,
    content,
    zIndex
  } = body as {
    boardId: string;
    parentBlockId?: string | null;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    content?: unknown;
    zIndex?: number;
  };

  // Verify board belongs to current user
  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id, user_id")
    .eq("id", boardId)
    .single();

  if (boardError || !board || board.user_id !== user.id) {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: 403
      }
    );
  }

  const created = await createBlock(supabase, {
    boardId,
    parentBlockId: parentBlockId ?? null,
    type,
    x,
    y,
    width,
    height,
    color,
    content,
    zIndex
  });

  return NextResponse.json(created, { status: 201 });
}

