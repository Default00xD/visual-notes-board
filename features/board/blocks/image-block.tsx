"use client";

import { useEffect, useState } from "react";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ImageContent {
  url: string;
  caption?: string;
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
    if (!file) return;

    try {
      setIsUploading(true);
      const supabase = getSupabaseBrowserClient();
      const extension = file.name.split(".").pop() ?? "png";
      const path = `${block.boardId}/${block.id}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(path, file, {
          upsert: true
        });

      if (uploadError) {
        // eslint-disable-next-line no-console
        console.error(uploadError);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

      persist({
        url: publicUrl,
        caption: content?.caption
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCaptionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const caption = event.target.value;
    if (!content) return;
    persist({
      ...content,
      caption
    });
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Image</span>
        <label className="inline-flex cursor-pointer items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-200">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {isUploading ? "Uploading…" : "Upload"}
        </label>
      </div>
      <div className="flex-1 overflow-hidden rounded-md bg-slate-100/80">
        {content?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.url}
            alt={content.caption ?? "Image"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
            No image yet
          </div>
        )}
      </div>
      <Input
        placeholder="Caption..."
        defaultValue={content?.caption ?? ""}
        onBlur={handleCaptionBlur}
        className="h-7 border-none bg-transparent px-0 text-[11px] shadow-none placeholder:text-slate-400 focus-visible:ring-0"
      />
    </div>
  );
}

