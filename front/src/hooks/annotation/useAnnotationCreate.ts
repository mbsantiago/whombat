import { useCallback } from "react";

import { scaleGeometryToWindow } from "@/utils/geometry";
import { type ScratchState } from "@/hooks/motions/useDrag";
import useCreateBBox from "@/hooks/draw/useCreateBBox";
import useCreateInterval from "@/hooks/draw/useCreateInterval";
import useCreateTimeStamp from "@/hooks/draw/useCreateTimeStamp";
import { type Dimensions } from "@/utils/types";
import { type CreateAnnotationEvent } from "@/machines/annotate";
import { type SpectrogramWindow } from "@/api/spectrograms";

const CREATE_STYLE = {
  borderColor: "yellow",
  fillColor: "yellow",
  borderWidth: 2,
  borderDash: [5, 5],
  fillAlpha: 0.2,
};

export default function useAnnotationCreate({
  drag,
  window,
  send,
  active,
  geometryType = "TimeStamp",
}: {
  drag: ScratchState;
  window: SpectrogramWindow;
  send: (event: CreateAnnotationEvent) => void;
  active: boolean;
  geometryType: "BoundingBox" | "TimeStamp" | "TimeInterval";
}) {
  const handleBBoxCreate = useCallback(
    ({
      bbox,
      dims,
    }: {
      bbox: [number, number, number, number];
      dims: Dimensions;
    }) => {
      const geometry = scaleGeometryToWindow(
        dims,
        {
          type: "BoundingBox",
          coordinates: bbox,
        },
        window,
      );
      send({
        type: "CREATE",
        geometry,
      });
    },
    [send, window],
  );

  const handleTimeIntevalCreate = useCallback(
    ({ interval, dims }: { interval: [number, number]; dims: Dimensions }) => {
      const geometry = scaleGeometryToWindow(
        dims,
        {
          type: "TimeInterval",
          coordinates: interval,
        },
        window,
      );
      send({
        type: "CREATE",
        geometry,
      });
    },
    [send, window],
  );

  const handleTimeStampCreate = useCallback(
    ({ timeStamp, dims }: { timeStamp: number; dims: Dimensions }) => {
      const geometry = scaleGeometryToWindow(
        dims,
        {
          type: "TimeStamp",
          coordinates: timeStamp,
        },
        window,
      );
      send({
        type: "CREATE",
        geometry,
      });
    },
    [send, window],
  );

  const { draw: drawBBox } = useCreateBBox({
    drag,
    active: active && geometryType === "BoundingBox",
    onCreate: handleBBoxCreate,
    style: CREATE_STYLE,
  });

  const { draw: drawInterval } = useCreateInterval({
    drag,
    active: active && geometryType === "TimeInterval",
    onCreate: handleTimeIntevalCreate,
    style: CREATE_STYLE,
  });

  const { draw: drawTimeStamp } = useCreateTimeStamp({
    drag,
    active: active && geometryType === "TimeStamp",
    onCreate: handleTimeStampCreate,
    style: CREATE_STYLE,
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!active) return;
      if (geometryType === "BoundingBox") {
        drawBBox(ctx);
        return;
      }
      if (geometryType === "TimeInterval") {
        drawInterval(ctx);
        return;
      }
      if (geometryType === "TimeStamp") {
        drawTimeStamp(ctx);
        return;
      }
    },
    [active, geometryType, drawBBox, drawInterval, drawTimeStamp],
  );

  return draw;
}
