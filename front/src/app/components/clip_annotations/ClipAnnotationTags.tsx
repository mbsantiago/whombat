import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";
import useStore from "@/app/store";
import ClipAnnotationTagsBase from "@/lib/components/clip_annotations/ClipAnnotationTags";
import type { TagSearchBarProps } from "@/lib/components/tags/TagSearchBar";
import type { ClipAnnotation } from "@/lib/types";
import { useCallback } from "react";
import toast from "react-hot-toast";

import ProjectTagSearch from "../tags/ProjectTagsSearch";

export default function ClipAnnotationTags({
  clipAnnotation,
}: {
  clipAnnotation: ClipAnnotation;
}) {
  const tagColorFn = useStore((state) => state.getTagColor);

  const { data, removeClipAnnotationTag, addClipAnnotationTag } =
    useClipAnnotation({
      uuid: clipAnnotation?.uuid,
      clipAnnotation,
    });

  const handleClearTags = useCallback(async () => {
    const tags = data?.tags?.slice(0);
    if (!tags) return;
    for (const tag of tags) {
      await removeClipAnnotationTag.mutateAsync(tag);
    }
  }, [data, removeClipAnnotationTag]);

  const TagSearchBar = useCallback(
    (props: TagSearchBarProps) => (
      <ProjectTagSearch placement="bottom-end" {...props} />
    ),
    [],
  );

  return (
    <ClipAnnotationTagsBase
      tags={data?.tags || []}
      TagSearchBar={TagSearchBar}
      tagColorFn={tagColorFn}
      onAddTag={(tag) =>
        addClipAnnotationTag.mutate(tag, {
          onSuccess: () => toast.success("Tag added"),
        })
      }
      onRemoveTag={(tag) =>
        removeClipAnnotationTag.mutate(tag, {
          onSuccess: () => toast.success("Tag removed"),
        })
      }
      onClearTags={handleClearTags}
    />
  );
}
