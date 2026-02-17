import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateDefaultBoard } from "@/services/boards";
import { getBlocksForBoard } from "@/services/blocks";
import { BoardCanvasShell } from "@/features/board/board-canvas-shell";

export default async function AppPage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const board = await getOrCreateDefaultBoard(supabase, user.id);
  const blocks = await getBlocksForBoard(supabase, board.id);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <BoardCanvasShell initialBoard={board} initialBlocks={blocks} />
    </div>
  );
}

