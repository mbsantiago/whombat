import { useCallback } from "react";

import { scaleGeometryToWindow } from "@/utils/geometry";
import { type ScratchState } from "@/hooks/motions/useDrag";
import useCreateBBox from "@/hooks/draw/useCreateBBox";
import { type CreateAnnotationEvent } from "@/machines/annotate";
import { type SpectrogramWindow } from "@/api/spectrograms";

const CREATE_BBOX_STYLE = {
  borderColor: "yellow",
  borderWidth: 2,
  borderDash: [5, 5],
};

export default function useAnnotationCreate({
  drag,
  window,
  send,
  active,
}: {
  drag: ScratchState;
  window: SpectrogramWindow;
  send: (event: CreateAnnotationEvent) => void;
  active: boolean;
}) {
  const handleBBoxCreate = useCallback(
    ({
      bbox,
      dims,
    }: {
      bbox: [number, number, number, number];
      dims: { width: number; height: number };
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

  const { draw } = useCreateBBox({
    drag,
    active,
    onCreate: handleBBoxCreate,
    style: CREATE_BBOX_STYLE,
  });

  return draw;
}
