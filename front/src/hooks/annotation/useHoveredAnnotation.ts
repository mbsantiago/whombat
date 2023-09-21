import { useMemo } from "react";

import { isCloseToGeometry, scaleGeometryToViewport } from "@/utils/geometry";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type Annotation } from "@/api/annotations";
import { type SpectrogramWindow } from "@/api/spectrograms";

export default function useHoveredAnnotations({
  mouse,
  annotations,
  window,
  active = true,
}: {
  mouse: MouseState;
  annotations: Annotation[];
  window: SpectrogramWindow;
  active?: boolean;
}) {
  const { elX, elY, elH, elW } = mouse;

  const annotationsInWindow = useMemo(() => {
    if (!active) return [];
    const { min: startTime, max: endTime } = window.time;
    const { min: lowFreq, max: highFreq } = window.freq;
    return annotations.filter((annotation) => {
      const { geometry } = annotation.sound_event;

      // Remove annotations without geometry
      if (geometry == null) return false;

      // In some cases it is easy to check if the geometry is
      // outside the current window. In such cases, we can avoid
      // checking if the mouse is close to the geometry.
      switch (geometry.type) {
        case "Point":
          // @ts-ignore
          const [x, y] = geometry.coordinates;
          return (
            x >= startTime && x <= endTime && y >= lowFreq && y <= highFreq
          );
        case "TimeStamp":
          const t = geometry.coordinates;
          // @ts-ignore
          return t >= startTime && t <= endTime;
        case "TimeInterval":
          // @ts-ignore
          const [t1, t2] = geometry.coordinates;
          return t2 >= startTime && t1 <= endTime;
        case "BoundingBox":
          // @ts-ignore
          const [x1, y1, x2, y2] = geometry.coordinates;
          return (
            x2 >= startTime && x1 <= endTime && y2 >= lowFreq && y1 <= highFreq
          );
      }

      return true;
    });
  }, [active, annotations, window]);

  // Scale annotation geometries to canvas viewport coordinates
  const scaledGeometries = useMemo(() => {
    if (!active) return [];

    return annotationsInWindow
      .map((annotation) => {
        const { geometry } = annotation.sound_event;
        return scaleGeometryToViewport(
          {
            width: elW,
            height: elH,
          },
          // @ts-ignore
          geometry,
          window,
        );
      });
  }, [active, annotationsInWindow, window, elW, elH]);

  // Check if mouse is close to any annotation
  const hovered = useMemo(() => {
    if (!active) return null;
    const hov = scaledGeometries.findIndex((geometry) => {
      if (geometry == null) return false;
      // @ts-ignore
      const hovered = isCloseToGeometry([elX, elY], geometry);
      return hovered;
    });
    return hov;
  }, [scaledGeometries, elX, elY, active]);

  return hovered == null ? null : annotationsInWindow[hovered] ?? null;
}
