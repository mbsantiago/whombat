import { useCallback } from "react";
import useStore from "@/app/store";
import useTags from "@/app/hooks/api/useTags";
import TagSearchBarBase, {
  type TagSearchBarProps,
} from "@/lib/components/tags/TagSearchBar";
import type { Tag } from "@/lib/types";

/**
 * TagSearchBar Component
 *
 * This component is a wrapper around the `TagSearchBarBase` component,
 * providing additional functionality such as fetching tags from an API and
 * handling tag creation.
 *
 * The component uses the `useTags` hook to fetch tags and handle tag creation.
 * It also uses the `useStore` hook to get the function for determining tag
 * colors.
 *
 * Example usage:
 *
 * ```tsx
 * <TagSearchBar
 *   onCreateTag={(tag) => console.log('Tag created', tag)}
 *   filter={{ dataset: { eq: "dataset-id"} }}
 * />
 * ```
 */
export default function TagSearchBar({
  onCreateTag,
  filter: initialFilter,
  fixed,
  pageSize,
  enabled,
  ...props
}: TagSearchBarProps & Parameters<typeof useTags>[0]) {
  const tagColorFn = useStore((state) => state.getTagColor);
  const { items, create, filter } = useTags({
    filter: initialFilter,
    fixed,
    pageSize,
    enabled,
  });

  const handleCreateTag = useCallback(
    (tag: Tag) => {
      create.mutate(tag, {
        onSuccess: (data) => {
          onCreateTag?.(data);
        },
      });
    },
    [onCreateTag, create],
  );

  return (
    <TagSearchBarBase
      tags={items}
      tagColorFn={tagColorFn}
      onCreateTag={handleCreateTag}
      onChangeQuery={(query) => {
        if (query.key == null || query.value == null) {
          filter.update({
            search: query.q,
            key: undefined,
            value: undefined,
          });
        } else {
          filter.update({
            search: undefined,
            key: query.key,
            value: { has: query.value },
          });
        }
      }}
      {...props}
    />
  );
}
