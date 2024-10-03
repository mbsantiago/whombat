import { useCallback, useMemo } from "react";

import useEditGeometry from "@/lib/hooks/draw/useEditGeometry";

import { type Style } from "@/lib/draw/styles";
import type {
  Dimensions,
  Geometry,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/lib/types";
import {
  scaleGeometryToViewport,
  scaleGeometryToWindow,
} from "@/lib/utils/geometry";

export default function useEditAnnotationGeometry({
  viewport,
  dimensions,
  soundEventAnnotation,
  enabled = true,
  onChange,
  onCopy,
  onDeselect,
  style,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  soundEventAnnotation: SoundEventAnnotation | null;
  enabled?: boolean;
  onChange?: (geometry: Geometry) => void;
  onCopy?: (geometry: Geometry) => void;
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

  const handleOnCopy = useCallback(
    (geometry?: Geometry) => {
      if (geometry == null) return;
      const rescaled = scaleGeometryToWindow(dimensions, geometry, viewport);
      onCopy?.(rescaled);
    },
    [onCopy, viewport, dimensions],
  );

  const ret = useEditGeometry({
    dimensions,
    object: scaledGeometry,
    enabled: enabled,
    style: style,
    onDrop: handleOnCopy,
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
