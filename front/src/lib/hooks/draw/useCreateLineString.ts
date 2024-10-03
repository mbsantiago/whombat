import { useCallback, useEffect, useState } from "react";

import useWindowMotions from "@/lib/hooks/window/useWindowMotions";

import drawGeometry from "@/lib/draw/geometry";
import { DEFAULT_LINESTRING_STYLE } from "@/lib/draw/linestring";
import type { BorderStyle } from "@/lib/draw/styles";
import type {
  Coordinates,
  Dimensions,
  LineString,
  Position,
  SpectrogramWindow,
} from "@/lib/types";
import { scaleGeometryToViewport } from "@/lib/utils/geometry";

export default function useCreateLineString({
  viewport,
  dimensions,
  enabled = true,
  style = DEFAULT_LINESTRING_STYLE,
  onCreate,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  enabled?: boolean;
  style?: BorderStyle;
  onCreate?: (lineString: LineString) => void;
}) {
  const [coordinates, setCoordinates] = useState<Coordinates[] | null>(null);
  const [vertex, setVertex] = useState<Position | null>(null);

  const handleMoveStart = useCallback(() => {
    // Remove the last vertex that was added at click since movement means
    // that the user wants to move the vertex
    setCoordinates((prev) => prev?.slice(0, -1) ?? null);
    setVertex(null);
  }, []);

  const handleMove = useCallback(
    ({ initial, shift }: { initial: Position; shift: Position }) => {
      setVertex({
        time: initial.time + shift.time,
        freq: initial.freq - shift.freq,
      });
    },
    [],
  );

  const handleAddVertex = useCallback(
    ({
      point,
      shiftKey = false,
      ctrlKey = false,
    }: {
      point: Position;
      shiftKey: boolean;
      ctrlKey: boolean;
    }) => {
      // If control key is pressed, abort adding vertex
      if (ctrlKey) return;

      // If the linestring is too short or shift key is not pressed, add a
      // vertex
      if (coordinates == null || coordinates.length < 2 || !shiftKey) {
        setCoordinates((prev) => {
          if (prev == null) return [[point.time, point.freq]];
          return [...prev, [point.time, point.freq]];
        });
        return;
      }

      // Otherwise create a linestring
      const newCoordinates =
        coordinates == null
          ? [[point.time, point.freq]]
          : [...coordinates, [point.time, point.freq]];
      onCreate?.({ type: "LineString", coordinates: newCoordinates });
      setCoordinates(null);
    },
    [coordinates, onCreate],
  );

  const handleClick = useCallback(
    ({
      position: point,
      shiftKey = false,
      ctrlKey = false,
    }: {
      position: Position;
      shiftKey?: boolean;
      ctrlKey?: boolean;
    }) => {
      handleAddVertex({ point, shiftKey, ctrlKey });
    },
    [handleAddVertex],
  );

  const handleMoveEnd = useCallback(
    ({
      ctrlKey = false,
      shiftKey = false,
    }: { ctrlKey?: boolean; shiftKey?: boolean } = {}) => {
      if (vertex == null) return;
      handleAddVertex({ point: vertex, ctrlKey, shiftKey });
      setVertex(null);
    },
    [vertex, handleAddVertex],
  );

  const { props, isDragging } = useWindowMotions({
    enabled,
    viewport,
    dimensions,
    onClick: handleClick,
    onMoveStart: handleMoveStart,
    onMove: handleMove,
    onMoveEnd: handleMoveEnd,
  });

  // Create a drawing function for the bbox
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!enabled) return;

      if (coordinates != null) {
        const geometry: LineString = { type: "LineString", coordinates };
        const scaled = scaleGeometryToViewport(dimensions, geometry, viewport);
        drawGeometry(ctx, scaled, style);
      }

      if (vertex != null) {
        const scaledVertex = scaleGeometryToViewport(
          dimensions,
          { type: "Point", coordinates: [vertex.time, vertex.freq] },
          viewport,
        );
        drawGeometry(ctx, scaledVertex, style);
      }

      if (coordinates != null && vertex != null && coordinates.length > 0) {
        const lastVertex = coordinates[coordinates.length - 1];
        const geometry: LineString = {
          type: "LineString",
          coordinates: [lastVertex, [vertex.time, vertex.freq]],
        };
        const scaled = scaleGeometryToViewport(dimensions, geometry, viewport);
        drawGeometry(ctx, scaled, style);
      }
    },
    [enabled, coordinates, style, viewport, dimensions, vertex],
  );

  useEffect(() => {
    if (!enabled && coordinates != null) setCoordinates(null);
  }, [enabled, coordinates]);

  const clear = useCallback(() => {
    setCoordinates(null);
    setVertex(null);
  }, []);

  return {
    props,
    isDragging,
    draw,
    clear,
  };
}
