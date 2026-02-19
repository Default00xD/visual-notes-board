import { useState, useEffect } from "react";
import type { Json } from "@/types/database";
import type { BlockDto, BlockColor } from "@/services/blocks";
import { useBoardStore } from "@/store/board-store";
import { TextareaAutosize } from "@/features/board/components/textarea-autosize";

interface TextContent {
  text: string;
  [key: string]: Json | undefined;
}

interface TextBlockProps {
  block: BlockDto;
}

const PLACEHOLDER_COLOR_MAP: Record<BlockColor, string> = {
  dark: "placeholder:text-neutral-500",
  slate: "placeholder:text-slate-500",
  amber: "placeholder:text-amber-500/70",
  emerald: "placeholder:text-emerald-500/70",
  sky: "placeholder:text-sky-500/70",
  violet: "placeholder:text-violet-500/70",
  rose: "placeholder:text-rose-500/70"
};

export function TextBlock({ block }: TextBlockProps) {
  const { updateBlockContent } = useBoardStore();
  const initial = (block.content as TextContent | null)?.text ?? "";
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  const handleBlur = () => {
    console.log("[TextBlock] Blur - saving text", { blockId: block.id, textLength: value.length });
    void updateBlockContent({
      id: block.id,
      content: {
        text: value
      }
    }).then(() => {
      console.log("[TextBlock] Blur - text saved", { blockId: block.id });
    }).catch((error) => {
      console.error("[TextBlock] Blur - failed to save text", { blockId: block.id, error });
    });
  };

  const placeholderColor = PLACEHOLDER_COLOR_MAP[block.color] ?? PLACEHOLDER_COLOR_MAP.dark;

  return (
    <TextareaAutosize
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={handleBlur}
      placeholder="Type your note..."
      className={`min-h-[60px] w-full resize-none border-0 bg-transparent p-0 text-[13px] leading-relaxed text-slate-200 outline-none ${placeholderColor} focus:text-white focus-visible:ring-0 transition-colors`}
    />
  );
}
