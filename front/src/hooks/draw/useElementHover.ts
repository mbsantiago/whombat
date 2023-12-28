import { useCallback, useState } from "react";

import { type EditableElement, convertElementToGeometry } from "@/draw/edit";
import useHover from "@/hooks/utils/useHover";
import { isCloseToGeometry } from "@/utils/geometry";

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
