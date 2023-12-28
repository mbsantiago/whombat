import { useMemo } from "react";

import { type SoundEventAnnotation, type Tag } from "@/api/schemas";
import { type SpectrogramWindow } from "@/api/spectrograms";
import {
  bboxIntersection,
  computeGeometryBBox,
  isGeometryInWindow,
  scaleBBoxToViewport,
} from "@/utils/geometry";
import { type BBox, type Dimensions } from "@/utils/types";

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
  onAdd: (tag: Tag) => void;
  position: Position;
  active: boolean;
};

function getLabelPosition(
  annotation: SoundEventAnnotation,
  window: SpectrogramWindow,
  dimensions: Dimensions,
): Position {
  const windowBBox: BBox = [
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
  window,
  dimensions,
  send,
  active = true,
}: {
  annotations: SoundEventAnnotation[];
  window: SpectrogramWindow;
  dimensions: Dimensions;
  send: (event: any) => void;
  active?: boolean;
}) {
  const annotationsInWindow = useMemo(() => {
    return annotations.filter((annotation) => {
      // @ts-ignore
      return isGeometryInWindow(annotation.sound_event.geometry, window);
    });
  }, [annotations, window]);

  const groups: TagGroup[] = useMemo(() => {
    return annotationsInWindow.map((annotation) => {
      const position = getLabelPosition(annotation, window, dimensions);

      const group: TagElement[] =
        annotation.tags?.map((tag) => {
          const onClick = () => send({ type: "REMOVE_TAG", annotation, tag });
          return { tag: tag.tag, onClick };
        }) || [];

      const onAdd = (tag: Tag) => send({ type: "ADD_TAG", annotation, tag });
      return { tags: group, onAdd, position, annotation, active };
    });
  }, [annotationsInWindow, send, window, dimensions, active]);

  return groups;
}
