import { useCallback, useState } from "react";

import type { Tag } from "@/lib/types";
import { getTagKey } from "@/lib/utils/tags";

const _emptyTag: Tag[] = [];

export type TagPallete = {
  tags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (tag: Tag) => void;
  clearTags: () => void;
};

export default function useAnnotationTagPallete({
  tags: initialTags = _emptyTag,
  onAddTag,
  onRemoveTag,
  onClearTags,
}: {
  tags?: Tag[];
  onAddTag?: (tag: Tag) => void;
  onRemoveTag?: (tag: Tag) => void;
  onClearTags?: () => void;
} = {}) {
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const addTag = useCallback(
    (tag: Tag) => {
      setTags((prevTags) => {
        const newTags = [...prevTags];

        if (!newTags.some((t) => getTagKey(t) === getTagKey(tag))) {
          newTags.push(tag);
          onAddTag?.(tag);
        }

        return newTags;
      });
    },
    [onAddTag],
  );

  const removeTag = useCallback(
    (tag: Tag) => {
      setTags((prevTags) => {
        const newTags = prevTags.filter((t) => getTagKey(t) !== getTagKey(tag));
        if (newTags.length !== prevTags.length) onRemoveTag?.(tag);
        return newTags;
      });
    },
    [onRemoveTag],
  );

  const clearTags = useCallback(() => {
    setTags([]);
    onClearTags?.();
  }, [onClearTags]);

  return {
    tags,
    addTag,
    removeTag,
    clearTags,
  };
}
