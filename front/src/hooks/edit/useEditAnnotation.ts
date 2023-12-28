import { useCallback, useMemo } from "react";

import { type Style } from "@/draw/styles";
import useEditGeometry from "@/hooks/edit/useEditGeometry";
import {
  scaleGeometryToViewport,
  scaleGeometryToWindow,
} from "@/utils/geometry";

import type {
  Dimensions,
  Geometry,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/types";

export default function useEditAnnotationGeometry({
  viewport,
  dimensions,
  soundEventAnnotation,
  enabled = true,
  onChange,
  onDeselect,
  style,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  soundEventAnnotation: SoundEventAnnotation | null;
  enabled?: boolean;
  onChange?: (geometry: Geometry) => void;
  onDeselect?: () => void;
  style?: Style;
}) {
  const { geometry } = soundEventAnnotation?.sound_event ?? {};

  const scaledGeometry = useMemo(() => {
    if (geometry == null) return null;
    return scaleGeometryToViewport(dimensions, geometry, viewport);
  }, [geometry, viewport, dimensions]);

  const handleOnChange = useCallback(
    (geometry?: Geometry) => {
      if (geometry == null) return;
      const rescaled = scaleGeometryToWindow(dimensions, geometry, viewport);
      onChange?.(rescaled);
    },
    [onChange, viewport, dimensions],
  );

  const ret = useEditGeometry({
    dimensions,
    object: scaledGeometry,
    active: enabled,
    style,
    onChange: handleOnChange,
    onDeselect: onDeselect,
  });

  const reconstructed = useMemo(() => {
    if (ret.object === null) return null;
    return scaleGeometryToWindow(dimensions, ret.object, viewport);
  }, [dimensions, viewport, ret.object]);

  return {
    ...ret,
    geometry: reconstructed,
  };
}
