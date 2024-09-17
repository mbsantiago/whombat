import AnnotationTagPaletteBase from "@/lib/components/annotation/AnnotationTagPalette";
import TagSearchBar from "@/app/components/tags/TagSearchBar";

import toast from "react-hot-toast";
import useStore from "@/app/store";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import type { Tag, ClipAnnotation } from "@/lib/types";

export default function AnnotationTagPalette({
  clipAnnotation,
  tags,
  onTagsChange,
}: {
  clipAnnotation?: ClipAnnotation;
  tags: Tag[];
  onTagsChange?: (tags: Tag[]) => void;
}) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const { addClipAnnotationTag } = useClipAnnotation({
    uuid: clipAnnotation?.uuid || "",
    clipAnnotation: clipAnnotation || undefined,
    enabled: clipAnnotation != null,
  });

  return (
    <AnnotationTagPaletteBase
      tags={tags}
      TagSearchBar={TagSearchBar}
      tagColorFn={tagColorFn}
      onSelectTag={(tag) => {
        if (tags.find((t) => t.key === tag.key && t.value === tag.value))
          return;
        onTagsChange?.([...tags, tag]);
      }}
      onRemoveTag={(tag) => {
        onTagsChange?.(
          tags.filter((t) => t.key !== tag.key || t.value !== tag.value),
        );
      }}
      onClick={(tag) => addClipAnnotationTag.mutate(tag, { onSuccess: () => toast.success("Tag added.")})}
    />
  );
}
