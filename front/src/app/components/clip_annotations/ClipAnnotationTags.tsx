import { useCallback } from "react";
import ClipAnnotationTagsBase from "@/lib/components/clip_annotations/ClipAnnotationTags";
import TagSearchBar from "@/app/components/tags/TagSearchBar";
import toast from "react-hot-toast";

import useStore from "@/app/store";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import type { ClipAnnotation } from "@/lib/types";

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

  return (
    <ClipAnnotationTagsBase
      tags={data?.tags || []}
      TagSearchBar={(props) => (
        <TagSearchBar placement="bottom-end" {...props} />
      )}
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
