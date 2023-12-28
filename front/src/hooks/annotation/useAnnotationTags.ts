import { useMemo } from "react";

import {
  bboxIntersection,
  computeGeometryBBox,
  isGeometryInWindow,
  scaleBBoxToViewport,
} from "@/utils/geometry";

import type {
  Box,
  Dimensions,
  SoundEventAnnotation,
  SpectrogramWindow,
  Tag,
} from "@/types";

export type TagElement = {
  tag: Tag;
  onClick: () => void;
};

export type Position = {
  x: number;
  y: number;
  offset: number;
  placement: "left" | "right" | "bottom" | "top";
};

export type TagGroup = {
  annotation: SoundEventAnnotation;
  tags: TagElement[];
  position: Position;
  active: boolean;
  onAdd?: (tag: Tag) => void;
};

function getLabelPosition(
  annotation: SoundEventAnnotation,
  window: SpectrogramWindow,
  dimensions: Dimensions,
): Position {
  const windowBBox: Box = [
    window.time.min,
    window.freq.min,
    window.time.max,
    window.freq.max,
  ];
  // @ts-ignore
  const bbox = computeGeometryBBox(annotation.sound_event.geometry);
  const intersection = bboxIntersection(bbox, windowBBox);

  if (intersection === null) {
    throw new Error("Annotation is not in the window");
  }

  const viewportBBox = scaleBBoxToViewport(dimensions, intersection, window);

  if (viewportBBox[2] > dimensions.width - 50) {
    return {
      x: viewportBBox[0],
      y: viewportBBox[3],
      offset: 5,
      placement: "left",
    };
  }

  return {
    x: viewportBBox[2],
    y: viewportBBox[1],
    offset: 5,
    placement: "right",
  };
}

export default function useAnnotationTags({
  annotations,
  viewport,
  dimensions,
  onClickTag,
  onAddTag,
  enabled = true,
}: {
  annotations: SoundEventAnnotation[];
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  onClickTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  onAddTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  enabled?: boolean;
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
        active: enabled,
      };
    });
  }, [
    annotationsInWindow,
    viewport,
    dimensions,
    enabled,
    onClickTag,
    onAddTag,
  ]);

  return groups;
}
