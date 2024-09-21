import type { DoublePressHandler, Position } from "@/lib/types";
import { useMemo } from "react";

export default function useViewportDoublePress({
  cursorPosition,
  onDoublePress,
}: {
  cursorPosition: React.MutableRefObject<Position>;
  onDoublePress?: DoublePressHandler;
}) {
  return useMemo(() => {
    const handleDoublePress = (e: React.MouseEvent) => {
      onDoublePress?.({
        position: cursorPosition.current,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        type: "dblpress",
        stopPropagation: e.stopPropagation,
        preventDefault: e.preventDefault,
      });
    };

    return {
      doublePressProps: {
        onDoubleClickCapture: handleDoublePress,
      },
    };
  }, [onDoublePress]); // eslint-disable-line
}
