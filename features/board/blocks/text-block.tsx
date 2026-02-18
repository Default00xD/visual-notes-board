import { useState, useEffect } from "react";
import type { Json } from "@/types/database";
import type { BlockDto } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { TextareaAutosize } from "@/features/board/components/textarea-autosize";

interface TextContent {
  text: string;
  [key: string]: Json | undefined;
}

interface TextBlockProps {
  block: BlockDto;
}

export function TextBlock({ block }: TextBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as TextContent | null)?.text ?? "";
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const handleBlur = () => {
    void updateBlockContent({
      id: block.id,
      content: {
        text: value
      }
    });
  };

  return (
    <TextareaAutosize
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={handleBlur}
      placeholder="Type your note..."
      className="min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-[13px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
    />
  );
}

