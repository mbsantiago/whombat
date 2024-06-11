import { useMemo } from "react";

import type { Position } from "@/types";

export type DoublePressEvent = {
  position: Position;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  type: "dblpress";
  stopPropagation: () => void;
  preventDefault: () => void;
};

export default function useViewportDoublePress({
  cursorPosition,
  onDoublePress,
}: {
  cursorPosition: React.MutableRefObject<Position>;
  onDoublePress?: (event: DoublePressEvent) => void;
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
