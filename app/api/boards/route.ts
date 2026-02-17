import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getBoardsForUser } from "@/services/boards";

export async function GET() {
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

  const boards = await getBoardsForUser(supabase, user.id);

  return NextResponse.json(boards);
}

