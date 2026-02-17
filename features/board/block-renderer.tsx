import type { BlockDto } from "@/services/blocks";
import { TextBlock } from "@/features/board/blocks/text-block";
import { ChecklistBlock } from "@/features/board/blocks/checklist-block";
import { ListBlock } from "@/features/board/blocks/list-block";
import { LikesBlock } from "@/features/board/blocks/likes-block";
import { ImageBlock } from "@/features/board/blocks/image-block";
import { FolderBlock } from "@/features/board/blocks/folder-block";

interface BlockRendererProps {
  block: BlockDto;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return <TextBlock block={block} />;
    case "checklist":
      return <ChecklistBlock block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "likes":
      return <LikesBlock block={block} />;
    case "image":
      return <ImageBlock block={block} />;
    case "folder":
      return <FolderBlock block={block} />;
    default:
      return null;
  }
}

