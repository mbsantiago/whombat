import AnnotationTagPaletteBase from "@/lib/components/annotation/AnnotationTagPalette";
import ProjectTagSearch from "../tags/ProjectTagsSearch";

import toast from "react-hot-toast";
import useStore from "@/app/store";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import type { Tag, ClipAnnotation } from "@/lib/types";

export default function AnnotationTagPalette({
  clipAnnotation,
  tags,
  onAddTag,
  onRemoveTag,
}: {
  clipAnnotation?: ClipAnnotation;
  tags: Tag[];
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
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
      TagSearchBar={ProjectTagSearch}
      tagColorFn={tagColorFn}
      onSelectTag={onAddTag}
      onRemoveTag={onRemoveTag}
      onClick={(tag) =>
        addClipAnnotationTag.mutate(tag, {
          onSuccess: () => toast.success("Tag added."),
        })
      }
    />
  );
}
