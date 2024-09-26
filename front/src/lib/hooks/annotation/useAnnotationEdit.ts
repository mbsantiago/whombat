import { useCallback } from "react";

import useEditAnnotationGeometry from "@/lib/hooks/draw/useEditAnnotation";

import type {
  Dimensions,
  Geometry,
  SoundEventAnnotation,
  SpectrogramWindow,
} from "@/lib/types";

const PRIMARY = "rgb(16 185 129)";

const EDIT_STYLE = {
  borderColor: PRIMARY,
  fillColor: PRIMARY,
  borderWidth: 2,
  borderDash: [6, 6],
  fillAlpha: 0.2,
};

export default function useAnnotationEdit({
  viewport,
  dimensions,
  annotation,
  enabled = true,
  onEdit,
  onCopy,
  onDeselect,
}: {
  viewport: SpectrogramWindow;
  dimensions: Dimensions;
  annotation: SoundEventAnnotation | null;
  enabled?: boolean;
  onEdit?: (geometry: Geometry) => void;
  onCopy?: (annotation: SoundEventAnnotation, geometry: Geometry) => void;
  onDeselect?: () => void;
}) {
  const handleCopy = useCallback(
    (geometry: Geometry) => {
      if (annotation !== null) {
        onCopy?.(annotation, geometry);
      }
    },
    [annotation, onCopy],
  );

  const { draw, props } = useEditAnnotationGeometry({
    viewport,
    dimensions,
    soundEventAnnotation: annotation,
    enabled,
    onChange: onEdit,
    onCopy: handleCopy,
    onDeselect,
    style: EDIT_STYLE,
  });

  return {
    draw,
    props,
  };
}
