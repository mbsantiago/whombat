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
  active?: boolean;
  disabled?: boolean;
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

  const [left, top, right, bottom] = scaleBBoxToViewport(
    dimensions,
    intersection,
    window,
  );

  const tooLeft = left < 50;
  const tooBottom = bottom > dimensions.height - 50;
  const tooRight = right > dimensions.width - 50;
  const tooTop = top < 50;

  switch (true) {
    case tooLeft && tooTop:
      return {
        x: right,
        y: bottom,
        offset: 5,
        placement: "right",
      };

    case tooLeft && tooBottom:
      return {
        x: right,
        y: top,
        offset: 5,
        placement: "right",
      };

    case tooRight && tooTop:
      return {
        x: left,
        y: bottom,
        offset: 5,
        placement: "left",
      };

    case tooRight && tooBottom:
      return {
        x: left,
        y: top,
        offset: 5,
        placement: "left",
      };

    case tooLeft:
      return {
        x: right,
        y: top,
        offset: 5,
        placement: "right",
      };

    case tooRight:
      return {
        x: left,
        y: top,
        offset: 5,
        placement: "left",
      };

    case tooTop:
      return {
        x: left,
        y: bottom,
        offset: 5,
        placement: "bottom",
      };

    case tooBottom:
      return {
        x: right,
        y: top,
        offset: 5,
        placement: "right",
      };

    default:
      return {
        x: right,
        y: top,
        offset: 5,
        placement: "right",
      };
  }
}

export default function useAnnotationTags({
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
