import { useMemo } from "react";

import type {
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
  Tag,
} from "@/lib/types";
import { isGeometryInWindow } from "@/lib/utils/geometry";
import { getLabelPosition } from "@/lib/utils/tags";
import type { TagElement, TagGroup } from "@/lib/utils/tags";

export default function useSpectrogramTags({
  annotations,
  viewport,
  dimensions,
  onClickTag,
  onAddTag,
  active = true,
  disabled = false,
}: {
  annotations: SoundEventAnnotation[];
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  onClickTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  onAddTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  active?: boolean;
  disabled?: boolean;
}) {
  const annotationsInWindow = useMemo(() => {
    return annotations.filter((annotation) => {
      // @ts-ignore
      return isGeometryInWindow(annotation.sound_event.geometry, viewport);
    });
  }, [annotations, viewport]);

  const groups: TagGroup[] = useMemo(() => {
    return annotationsInWindow.map((annotation) => {
      const position = getLabelPosition(annotation, viewport, dimensions);

      const group: TagElement[] =
        annotation.tags?.map((tag) => {
          return {
            tag: tag,
            onClick: () => onClickTag?.(annotation, tag),
          };
        }) || [];

      return {
        tags: group,
        onAdd: (tag) => onAddTag?.(annotation, tag),
        position,
        annotation,
        active,
        disabled,
      };
    });
  }, [
    annotationsInWindow,
    viewport,
    dimensions,
    active,
    onClickTag,
    onAddTag,
    disabled,
  ]);

  return groups;
}
