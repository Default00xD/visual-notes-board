import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteBlock, updateBlock } from "@/services/blocks";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function ensureOwnership(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  id: string,
  userId: string
): Promise<boolean> {
  const { data: blockData, error: blockError } = await supabase
    .from("blocks")
    .select("board_id")
    .eq("id", id)
    .single();

  if (blockError || !blockData) return false;

  const { data: boardData, error: boardError } = await supabase
    .from("boards")
    .select("user_id")
    .eq("id", blockData.board_id)
    .single();

  if (boardError || !boardData) return false;

  return boardData.user_id === userId;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const { id } = await params;

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

  const owned = await ensureOwnership(supabase, id, user.id);
  if (!owned) {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: 403
      }
    );
  }

  const body = await request.json();

  const updated = await updateBlock(supabase, {
    id,
    fields: body
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const { id } = await params;

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

  const owned = await ensureOwnership(supabase, id, user.id);
  if (!owned) {
    return NextResponse.json(
      { error: "Forbidden" },
      {
        status: 403
      }
    );
  }

  await deleteBlock(supabase, id);

  return NextResponse.json({ success: true }, { status: 204 });
}

