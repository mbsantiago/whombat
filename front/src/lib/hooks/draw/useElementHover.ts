import { useCallback, useState } from "react";

import useHover from "@/lib/hooks/utils/useHover";

import {
  type EditableElement,
  convertElementToGeometry,
} from "@/lib/draw/edit";
import { isCloseToGeometry } from "@/lib/utils/geometry";

export default function useElementHover<J>({
  elements,
  enabled = true,
}: {
  elements: EditableElement<J>[];
  enabled?: boolean;
}) {
  const [hovered, setHovered] = useState<EditableElement<J> | null>(null);

  const onHover = useCallback(
    ({ position }: { position: { x: number; y: number } }) => {
      const hovered = elements.find((element) => {
        const geom = convertElementToGeometry(element);
        return isCloseToGeometry([position.x, position.y], geom);
      });
      if (!hovered) {
        setHovered(null);
        return;
      }
      setHovered(hovered);
    },
    [elements],
  );

  const hoverProps = useHover({ onHover, enabled });

  return {
    hovered,
    hoverProps,
  };
}
