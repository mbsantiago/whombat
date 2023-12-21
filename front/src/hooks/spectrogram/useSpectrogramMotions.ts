import { useState, useMemo, useCallback } from "react";
import { type SpectrogramWindow } from "@/api/spectrograms";
import useSpectrogramDrag from "./useSpectrogramDrag";
import useSpectrogramZoom from "./useSpectrogramZoom";
import useSpectrogramScrollMove from "./useSpectrogramScrollMove";
import useSpectrogramScrollZoom from "./useSpectrogramScrollZoom";
import { mergeProps } from "react-aria";

/**
 * The motion modes supported by the spectrogram motions.
 *
 * @description Either "drag", "zoom", or "idle".
 */
type MotionMode = "drag" | "zoom" | "idle";

/**
 * The state of the spectrogram motions.
 *
 * @property {boolean} canDrag - Indicates whether dragging is allowed.
 * @property {boolean} canZoom - Indicates whether zooming is allowed.
 * @property {boolean} enabled - Indicates whether the motions are enabled.
 */
export type MotionState = {
  canDrag: boolean;
  canZoom: boolean;
  enabled: boolean;
};

/**
 * The controls for managing spectrogram motions.
 *
 * @property {Function} enableDrag - Enables dragging mode.
 * @property {Function} enableZoom - Enables zooming mode.
 * @property {Function} disable - Disables all motions.
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
  enabled = true,
}: {
  viewport: SpectrogramWindow;
  dimensions: { width: number; height: number };
  onDragStart?: () => void;
  onDrag?: (window: SpectrogramWindow) => void;
  onDragEnd?: () => void;
  onZoom?: (prev: SpectrogramWindow, next: SpectrogramWindow) => void;
  onModeChange?: (mode: MotionMode) => void;
  onScrollMoveTime?: (time: number) => void;
  onScrollMoveFreq?: (freq: number) => void;
  onScrollZoomTime?: (time: number) => void;
  onScrollZoomFreq?: (time: number) => void;
  enabled?: boolean;
}) {
  const [motionMode, setMotionMode] = useState<MotionMode>(
    enabled ? "drag" : "idle",
  );

  const { dragProps } = useSpectrogramDrag({
    viewport,
    dimensions,
    onDragStart,
    onDrag,
    onDragEnd,
    enabled: enabled && motionMode === "drag",
  });

  const handleOnZoom = useCallback(
    (prev: SpectrogramWindow, next: SpectrogramWindow) => {
      onZoom?.(prev, next);
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

  const { scrollProps: scrollMoveTimeProps } = useSpectrogramScrollMove({
    viewport,
    dimensions,
    onScroll: onScrollMoveTime,
    shift: true,
    enabled,
  });

  const { scrollProps: scrollZoomTimeProps } = useSpectrogramScrollZoom({
    dimensions,
    onScroll: onScrollZoomTime,
    shift: true,
    alt: true,
    enabled,
  });

  const { scrollProps: scrollMoveFreqProps } = useSpectrogramScrollMove({
    viewport,
    dimensions,
    onScroll: onScrollMoveFreq,
    ctrl: true,
    enabled,
  });

  const { scrollProps: scrollZoomFreqProps } = useSpectrogramScrollZoom({
    dimensions,
    onScroll: onScrollZoomFreq,
    ctrl: true,
    alt: true,
    enabled,
  });

  const props = mergeProps(
    dragProps,
    zoomProps,
    scrollMoveTimeProps,
    scrollZoomTimeProps,
    scrollZoomFreqProps,
    scrollMoveFreqProps,
  );

  const motionState = useMemo<MotionState>(() => {
    return {
      canDrag: enabled && motionMode === "drag",
      canZoom: enabled && motionMode === "zoom",
      enabled,
    };
  }, [enabled, motionMode]);

  const motionControls = useMemo<MotionControls>(() => {
    return {
      enableDrag: () => {
        onModeChange?.("drag");
        setMotionMode("drag");
      },
      enableZoom: () => {
        onModeChange?.("zoom");
        setMotionMode("zoom");
      },
      disable: () => {
        onModeChange?.("idle");
        setMotionMode("idle");
      },
    };
  }, [onModeChange]);

  return {
    props,
    draw,
    state: motionState,
    controls: motionControls,
  } as const;
}
