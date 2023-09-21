import { useCallback, useMemo } from "react";

import {
  scaleGeometryToViewport,
  scaleGeometryToWindow,
} from "@/utils/geometry";
import useEditGeometry from "@/hooks/edit/useEditGeometry";
import { type MouseState } from "@/hooks/motions/useMouse";
import { type DragState } from "@/hooks/motions/useDrag";
import { type Geometry } from "@/utils/types";
import { type Style } from "@/draw/styles";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Annotation } from "@/api/annotations";

interface UseEditAnnotationProps {
  drag: DragState;
  mouse: MouseState;
  window: SpectrogramWindow;
  annotation?: Annotation | null;
  active: boolean;
  style: Style;
  onChange: (geometry: Geometry) => void;
  onEmptyClick?: () => void;
}

export default function useEditAnnotationGeometry({
  mouse,
  drag,
  window,
  annotation,
  active,
  onChange,
  onEmptyClick,
  style,
}: UseEditAnnotationProps) {
  const { geometry } = annotation?.sound_event ?? {};
  const { elW, elH } = mouse;

  // Scale geometry to viewport
  const scaledGeometry = useMemo(() => {
    if (geometry == null) return null;
    return scaleGeometryToViewport(
      {
        width: elW,
        height: elH,
      },
      // @ts-ignore
      geometry,
      window,
    );
  }, [geometry, window, elW, elH]);

  const handleOnChange = useCallback(
    (geometry?: Geometry) => {
      if (geometry == null) return;
      const rescaled = scaleGeometryToWindow(
        {
          width: elW,
          height: elH,
        },
        geometry,
        window,
      );
      onChange(rescaled);
    },
    [onChange, window, elW, elH],
  );

  const ret = useEditGeometry({
    mouse,
    drag,
    object: scaledGeometry,
    active,
    style,
    onChange: handleOnChange,
    onClickAway: onEmptyClick,
  });

  const reconstructed = useMemo(() => {
    if (ret.object === null) return null;
    return scaleGeometryToWindow(
      {
        width: elW,
        height: elH,
      },
      ret.object,
      window,
    );
  }, [elW, elH, window, ret.object]);

  return {
    ...ret,
    geometry: reconstructed,
  };
}
