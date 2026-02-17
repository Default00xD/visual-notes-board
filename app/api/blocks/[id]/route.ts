import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteBlock, updateBlock } from "@/services/blocks";

interface RouteParams {
  params: {
    id: string;
  };
}

async function ensureOwnership(
  supabase: ReturnType<typeof createSupabaseServerClient>,
  id: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("blocks")
    .select("id, board_id, boards!inner(user_id)")
    .eq("id", id)
    .single();

  if (error || !data) return false;

  // @ts-expect-error - joined boards relation
  return data.boards?.user_id === userId;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const supabase = createSupabaseServerClient();
  const id = params.id;

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
  const id = params.id;

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

