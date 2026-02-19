"use client";

import { useEffect, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ImageContent {
  url: string;
  caption?: string;
  [key: string]: Json | undefined;
}

interface ImageBlockProps {
  block: BlockDto;
}

const BUCKET_NAME = "visual-notes-images";

export function ImageBlock({ block }: ImageBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as ImageContent | null) ?? null;
  const [content, setContent] = useState<ImageContent | null>(initial);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  const persist = (next: ImageContent | null) => {
    setContent(next);
    void updateBlockContent({
      id: block.id,
      content: next ?? {}
    });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log("[ImageBlock] File change - no file selected", { blockId: block.id });
      return;
    }

    console.log("[ImageBlock] File change - start upload", { blockId: block.id, fileName: file.name, fileSize: file.size });
    try {
      setIsUploading(true);
      const supabase = getSupabaseBrowserClient();
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${block.boardId}/${block.id}-${Date.now()}.${extension}`;

      console.log("[ImageBlock] File change - uploading to storage", { blockId: block.id, path });
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          upsert: true
        });

      if (uploadError) {
        console.error("[ImageBlock] File change - upload failed", { blockId: block.id, error: uploadError });
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      console.log("[ImageBlock] File change - upload successful", { blockId: block.id, publicUrl });

      persist({
        url: publicUrl,
        caption: content?.caption
      });
      console.log("[ImageBlock] File change - content updated", { blockId: block.id });
    } finally {
      setIsUploading(false);
      console.log("[ImageBlock] File change - finished", { blockId: block.id });
    }
  };

  const handleCaptionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const caption = event.target.value;
    console.log("[ImageBlock] Caption blur - saving", { blockId: block.id, captionLength: caption.length });
    if (!content) {
      console.log("[ImageBlock] Caption blur - no content, skipping", { blockId: block.id });
      return;
    }
    persist({
      ...content,
      caption
    });
    console.log("[ImageBlock] Caption blur - saved", { blockId: block.id });
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Image</span>
        <label className="inline-flex cursor-pointer items-center rounded-full bg-slate-700/50 px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:bg-slate-700 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {isUploading ? "Uploading…" : "Upload"}
        </label>
      </div>
      <div className="flex-1 overflow-hidden rounded-md bg-slate-900/50 border border-slate-700/50">
        {content?.url ? (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={content.url}
            alt={content.caption ?? "Image"}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-500">
            No image yet
          </div>
        )}
      </div>
      <Input
        placeholder="Caption..."
        defaultValue={content?.caption ?? ""}
        onBlur={handleCaptionBlur}
        className="h-7 border-slate-700/50 bg-slate-800/50 text-slate-200 text-[11px] placeholder:text-slate-500 focus-visible:ring-primary focus-visible:border-primary"
      />
    </div>
  );
}
