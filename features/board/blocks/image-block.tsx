"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

interface ImageContent {
  url: string;
  caption?: string;
  aspectRatio?: number;
  [key: string]: Json | undefined;
}

interface ImageBlockProps {
  block: BlockDto;
}

const BUCKET_NAME = "visual-notes-images";

export interface ImageBlockHandle {
  openFilePicker: () => void;
}

export const ImageBlock = forwardRef<ImageBlockHandle, ImageBlockProps>(
  function ImageBlock({ block }, ref) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as ImageContent | null) ?? null;
  const [content, setContent] = useState<ImageContent | null>(initial);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      if (isUploading) return;
      fileInputRef.current?.click();
    }
  }));

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

      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight || 1;
        persist({
          url: publicUrl,
          caption: content?.caption,
          aspectRatio: ratio
        });
        console.log("[ImageBlock] File change - content updated with aspectRatio", {
          blockId: block.id,
          aspectRatio: ratio
        });
      };
      img.src = publicUrl;
    } finally {
      setIsUploading(false);
      console.log("[ImageBlock] File change - finished", { blockId: block.id });
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-xl bg-neutral-900/40"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {content?.url ? (
        <motion.img
          key={content.url}
          initial={{ opacity: 0.4, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          src={content.url}
          alt={content.caption ?? "Image"}
          draggable={false}
          className="h-full w-full object-cover pointer-events-none select-none"
          onLoad={(event) => {
            if (!content?.aspectRatio) {
              const img = event.currentTarget;
              const ratio = img.naturalWidth / img.naturalHeight || 1;
              persist({
                ...content,
                aspectRatio: ratio
              });
              console.log("[ImageBlock] onLoad - aspectRatio set from existing image", {
                blockId: block.id,
                aspectRatio: ratio
              });
            }
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-500">
          Нет изображения
        </div>
      )}

      {isUploading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-950/50 text-[11px] text-neutral-200">
          Загрузка...
        </div>
      )}
    </div>
  );
});
