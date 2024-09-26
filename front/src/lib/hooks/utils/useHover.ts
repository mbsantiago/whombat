import { useMemo } from "react";
import type { DOMAttributes } from "react";

export default function useHover<T>({
  enabled = true,
  onHover,
}: {
  enabled?: boolean;
  onHover: ({
    position,
    shift,
    ctrl,
  }: {
    position: { x: number; y: number };
    shift: boolean;
    ctrl: boolean;
  }) => void;
}): DOMAttributes<T> {
  const props = useMemo(
    () => ({
      onMouseMove: (e: React.MouseEvent<T>) => {
        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        onHover({
          position: { x, y },
          shift: e.shiftKey,
          ctrl: e.ctrlKey,
        });
      },
    }),
    [onHover],
  );

  if (!enabled) {
    return {};
  }

  return props;
}
