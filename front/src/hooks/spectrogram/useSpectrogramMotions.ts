import { useCallback, useState } from "react";
import { mergeProps } from "react-aria";

// import useSpectrogramDrag from "@/hooks/spectrogram/useSpectrogramDrag";
import useSpectrogramZoom from "@/hooks/spectrogram/useSpectrogramZoom";
import useWindowScroll from "@/hooks/window/useWindowScroll";

import type {
  Position,
  SpectrogramWindow,
  CanvasHandlers,
  ScrollEvent,
  MoveHandler,
  MoveStartHandler,
} from "@/types";
import type { ViewportController } from "@/hooks/window/useViewport";

/**
 * The motion modes supported by the spectrogram motions.
 *
 * @description Either "drag", "zoom", or "idle".
 */
export type MotionMode = "drag" | "zoom" | "idle";

/**
 * The state of the spectrogram motions.
 */
export type MotionState = {
  canDrag: boolean;
  canZoom: boolean;
  enabled: boolean;
};

/**
 * The controls for managing spectrogram motions.
 */
export type MotionControls = {
  enableDrag: () => void;
  enableZoom: () => void;
  disable: () => void;
};

/**
 * The `useSpectrogramMotions` hook manages different motion modes (drag, zoom)
 * for a spectrogram.
 */
export default function useSpectrogramMotions({
  viewport,
  dimensions,
  onDragStart,
  onDragEnd,
  onDrag,
  onZoom,
  onModeChange,
  onScrollMoveTime,
  onScrollMoveFreq,
  onScrollZoomTime,
  onScrollZoomFreq,
  onDoubleClick,
  enabled = true,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onDoubleClick?: (dblClickProps: { position: Position }) => void;
  onDragStart?: () => void;
  onDrag?: (window: SpectrogramWindow) => void;
  onDragEnd?: () => void;
  onZoom?: (window: SpectrogramWindow) => void;
  onModeChange?: (mode: MotionMode) => void;
  onScrollMoveTime?: (props: { time: number }) => void;
  onScrollMoveFreq?: (props: { freq: number }) => void;
  onScrollZoomTime?: (props: { time: number }) => void;
  onScrollZoomFreq?: (props: { freq: number }) => void;
  enabled?: boolean;
}) {
  const [motionMode, setMotionMode] = useState<MotionMode>(
    enabled ? "drag" : "idle",
  );

  // const { dragProps } = useSpectrogramDrag({
  //   viewport,
  //   dimensions,
  //   onDragStart,
  //   onDrag,
  //   onDragEnd,
  //   onDoubleClick,
  //   enabled: enabled && motionMode === "drag",
  // });

  const handleOnZoom = useCallback(
    (next: SpectrogramWindow) => {
      onZoom?.(next);
      setMotionMode("drag");
    },
    [onZoom],
  );

  const { zoomProps, draw } = useSpectrogramZoom({
    viewport,
    dimensions,
    onZoom: handleOnZoom,
    enabled: enabled && motionMode === "zoom",
  });

  const handleTimeScroll = useCallback(
    ({ time }: { time?: number }) => {
      if (time == null) return;
      onScrollMoveTime?.({ time });
    },
    [onScrollMoveTime],
  );

  const { scrollProps: scrollMoveTimeProps } = useWindowScroll({
    viewport,
    dimensions,
    onScroll: handleTimeScroll,
    shift: true,
    enabled,
    relative: false,
  });

  const handleTimeZoom = useCallback(
    ({ timeRatio }: { timeRatio?: number }) => {
      if (timeRatio == null) return;
      onScrollZoomTime?.({ time: 1 + timeRatio });
    },
    [onScrollZoomTime],
  );

  const { scrollProps: scrollZoomTimeProps } = useWindowScroll({
    viewport,
    dimensions,
    onScroll: handleTimeZoom,
    shift: true,
    alt: true,
    enabled,
    relative: true,
  });

  const handleFreqScroll = useCallback(
    ({ freq }: { freq?: number }) => {
      if (freq == null) return;
      onScrollMoveFreq?.({ freq });
    },
    [onScrollMoveFreq],
  );

  const { scrollProps: scrollMoveFreqProps } = useWindowScroll({
    viewport,
    dimensions,
    onScroll: handleFreqScroll,
    ctrl: true,
    enabled,
    relative: false,
  });

  const handleFreqZoom = useCallback(
    ({ freqRatio }: { freqRatio?: number }) => {
      if (freqRatio == null) return;
      onScrollZoomFreq?.({ freq: 1 + freqRatio });
    },
    [onScrollZoomFreq],
  );

  const { scrollProps: scrollZoomFreqProps } = useWindowScroll({
    viewport,
    dimensions,
    onScroll: handleFreqZoom,
    ctrl: true,
    alt: true,
    enabled,
    relative: true,
  });

  const props = mergeProps(
    dragProps,
    zoomProps,
    scrollMoveTimeProps,
    scrollZoomTimeProps,
    scrollZoomFreqProps,
    scrollMoveFreqProps,
  );

  const handleEnableDrag = useCallback(() => {
    onModeChange?.("drag");
    setMotionMode("drag");
  }, [onModeChange]);

  const handleEnableZoom = useCallback(() => {
    onModeChange?.("zoom");
    setMotionMode("zoom");
  }, [onModeChange]);

  const handleDisable = useCallback(() => {
    onModeChange?.("idle");
    setMotionMode("idle");
  }, [onModeChange]);

  return {
    props,
    draw,
    canDrag: enabled && motionMode === "drag",
    canZoom: enabled && motionMode === "zoom",
    enabled,
    enableDrag: handleEnableDrag,
    enableZoom: handleEnableZoom,
    disable: handleDisable,
  } as const;
}

export function useSpectrogramDrag({
  viewport,
}: {
  viewport: ViewportController;
}): {
  onMove: MoveHandler;
  onMoveStart: MoveStartHandler;
} {
  const { shift, save } = viewport;
  const onMove = useCallback(
    ({ shift: { time, freq } }: { shift: Position }) => {
      shift({ time: -time, freq });
    },
    [shift],
  );
  const onMoveStart = useCallback(() => {
    save();
  }, [save]);
  return {
    onMove,
    onMoveStart,
  };
}

export function useSpectrogramScroll({
  viewport,
}: {
  viewport: ViewportController;
}): CanvasHandlers {
  const { expand, shift, zoomToPosition } = viewport;

  const onScroll = useCallback(
    ({
      position,
      ctrlKey,
      shiftKey,
      altKey,
      timeFrac,
      freqFrac,
      deltaX,
      deltaY,
    }: ScrollEvent) => {
      if (altKey) {
        zoomToPosition({
          position,
          factor: 1 + 4 * timeFrac * (shiftKey ? deltaX : deltaY),
        });
      } else if (ctrlKey) {
        expand({
          time: timeFrac * (shiftKey ? deltaX : deltaY),
          freq: freqFrac * (shiftKey ? deltaY : deltaX),
        });
      } else {
        shift({
          time: timeFrac * (shiftKey ? deltaY : deltaX),
          freq: -freqFrac * (shiftKey ? deltaX : deltaY),
        });
      }
    },
    [expand, shift, zoomToPosition],
  );

  return {
    onScroll,
  };
}
