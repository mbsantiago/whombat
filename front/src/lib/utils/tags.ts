import type {
  Box,
  Color,
  Dimensions,
  SoundEventAnnotation,
  SoundEventPrediction,
  SpectrogramWindow,
  Tag,
  TimeInterval,
  TimeStamp,
} from "@/lib/types";
import {
  bboxIntersection,
  computeGeometryBBox,
  scaleBBoxToViewport,
  scaleTimeToViewport,
} from "@/lib/utils/geometry";

export { Color };

export const COLOR_NAMES = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export const LEVELS = [1, 2, 3, 4, 5, 6];

export type TagElement = {
  tag: Tag;
  score?: number;
  onClick?: () => void;
};

export type Position = {
  x: number;
  y: number;
  offset: number;
  placement: "left" | "right" | "bottom" | "top";
};

export type TagGroup = {
  annotation: SoundEventAnnotation | SoundEventPrediction;
  tags: TagElement[];
  position: Position;
  active?: boolean;
  disabled?: boolean;
  onAdd?: (tag: Tag) => void;
};

function getTimeIntervalLabelPosition({
  annotation,
  window,
  dimensions,
}: {
  annotation: SoundEventAnnotation | SoundEventPrediction;
  window: SpectrogramWindow;
  dimensions: Dimensions;
}): Position {
  const geometry = annotation.sound_event.geometry as TimeInterval;
  const {
    time: { min: startTime, max: endTime },
  } = window;
  const [start, end] = geometry.coordinates;

  if (end < startTime || start > endTime) {
    throw new Error("Annotation is not in the window");
  }

  const x = scaleTimeToViewport(start, window, dimensions.width);
  const x2 = scaleTimeToViewport(end, window, dimensions.width);

  const randomVal = Number(`0x${annotation.uuid.slice(-8)}`) / 0xffffffff;
  const y = 50 + randomVal * (dimensions.height - 100);

  const tooLeft = x < 50;
  const tooRight = x2 > dimensions.width - 50;

  if (tooLeft && tooRight) {
    return {
      x: x,
      y,
      offset: 5,
      placement: "right",
    };
  }

  if (tooLeft) {
    return {
      x: x2,
      y,
      offset: 5,
      placement: "left",
    };
  }

  if (tooRight) {
    return {
      x: x,
      y,
      offset: 5,
      placement: "left",
    };
  }

  return {
    x: x2,
    y,
    offset: 5,
    placement: "left",
  };
}

function getRandomHeight(height: number, uuid: string): number {
  const randomVal = Number(`0x${uuid.slice(-8)}`) / 0xffffffff;
  return 50 + randomVal * (height - 100);
}

function getTimeStampLabelPosition({
  annotation,
  window,
  dimensions,
}: {
  annotation: SoundEventAnnotation | SoundEventPrediction;
  window: SpectrogramWindow;
  dimensions: Dimensions;
}): Position {
  const geometry = annotation.sound_event.geometry as TimeStamp;
  const {
    time: { min: startTime, max: endTime },
  } = window;
  const time = geometry.coordinates;

  if (time < startTime || time > endTime) {
    throw new Error("Annotation is not in the window");
  }

  const x = scaleTimeToViewport(time, window, dimensions.width);

  // Get random height between 50 and dimensions.height - 50
  const y = getRandomHeight(dimensions.height, annotation.uuid);

  const tooLeft = x < 50;

  if (tooLeft) {
    return {
      x: x + 5,
      y,
      offset: 5,
      placement: "right",
    };
  }

  return {
    x: x - 5,
    y,
    offset: 5,
    placement: "left",
  };
}

export function getLabelPosition(
  annotation: SoundEventAnnotation | SoundEventPrediction,
  window: SpectrogramWindow,
  dimensions: Dimensions,
): Position {
  const { geometry } = annotation.sound_event;

  if (geometry.type === "TimeStamp") {
    return getTimeStampLabelPosition({
      annotation,
      window,
      dimensions,
    });
  }

  if (geometry.type === "TimeInterval") {
    return getTimeIntervalLabelPosition({
      annotation,
      window,
      dimensions,
    });
  }

  const windowBBox: Box = [
    window.time.min,
    window.freq.min,
    window.time.max,
    window.freq.max,
  ];

  const bbox = computeGeometryBBox(geometry);
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

const COLOR_STORE: Record<string, Color> = {};

export function getTagKey(tag: Tag): string {
  return `${tag.key}-${tag.value}`;
}

export function getRandomColor(): Color {
  const name = COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
  const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
  return { color: name, level };
}

export function getTagColor(tag: Tag): Color {
  const key = getTagKey(tag);
  if (COLOR_STORE[key]) {
    return COLOR_STORE[key];
  }

  const color = getRandomColor();
  COLOR_STORE[key] = color;
  return color;
}

export function getTagClassNames(color: string, level: number) {
  const background = `bg-${color}-${level}00 dark:bg-${color}-${10 - level}00`;
  const border = `border-${color}-${level + 2}00 dark:border-${color}-${
    10 - level - 2
  }00`;
  const text = `text-${color}-${level + 3}00 dark:text-${color}-${
    10 - level - 3
  }00`;
  return {
    background,
    border,
    text,
  };
}
