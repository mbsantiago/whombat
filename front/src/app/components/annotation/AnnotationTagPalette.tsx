import toast from "react-hot-toast";

import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import useStore from "@/app/store";

import AnnotationTagPaletteBase from "@/lib/components/annotation/AnnotationTagPalette";

import type { ClipAnnotation, Tag } from "@/lib/types";

import ProjectTagSearch from "../tags/ProjectTagsSearch";

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
      onCreateTag={onAddTag}
      onClick={(tag) =>
        addClipAnnotationTag.mutate(tag, {
          onSuccess: () => toast.success("Tag added."),
        })
      }
    />
  );
}
