import { useState, useRef, useEffect, useCallback } from "react";
import { useScratch, useMap } from "react-use";
import useSpectrogramCanvas from "@/hooks/useSpectrogramCanvas";
import useSpectrogramParameters from "@/hooks/useSpectrogramParameters";
import useMouseWheel from "@/hooks/useMouseWheel";
import useAudio from "@/hooks/useAudio";
import useWindowDrag from "@/hooks/useWindowDrag";
import useWindowScroll from "@/hooks/useWindowScroll";
import useWindowZoom from "@/hooks/useWindowZoom";
import useWindow from "@/hooks/useWindow";
import useBBoxZoom from "@/hooks/useBBoxZoom";
import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";
import Player from "@/components/Player";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import SpectrogramControls from "@/components/SpectrogramControls";

export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  window: SpectrogramWindow,
) => void;

export type SpectrogramState = {
  canZoom: boolean;
  canScroll: boolean;
  canDrag: boolean;
  canBBoxZoom: boolean;
  frozen: boolean;
};

/* This hook provides all the basic spectrogram functionality, including
 * playback, dragging, scrolling, and settings, with controls for each.
 */
export default function useSpectrogram({
  bounds,
  initial,
  recording,
  canDrag = false,
  canScroll = true,
  canZoom = true,
  canBBoxZoom = true,
  trackAudio = true,
  frozen = false,
}: {
  bounds: SpectrogramWindow;
  initial: SpectrogramWindow;
  recording: Recording;
  canDrag?: boolean;
  canScroll?: boolean;
  canZoom?: boolean;
  canBBoxZoom?: boolean;
  trackAudio?: boolean;
  frozen?: boolean;
}) {
  const [
    drawingFunctions,
    {
      set: setDrawingFunctions,
      setAll: setAllDrawingFunctions,
      remove: removeDrawingFunction,
      reset: resetDrawingFunctions,
    },
  ] = useMap<DrawFn>();

  const [spectrogramState, setSpectrogramState] = useState<SpectrogramState>({
    canZoom,
    canScroll,
    canDrag,
    canBBoxZoom,
    frozen,
  });

  const settings = useSpectrogramParameters({
    recording,
  });

  const { audio, controls, state } = useAudio({
    recording,
    speed: recording.samplerate > 96000 ? 44100 / recording.samplerate : 1,
  });

  // This holds the state for the current viewport of the spectrogram
  const currentWindow = useWindow({
    initial,
    bounds,
  });

  const {
    window: specWindow,
    centerOn,
    setWindow,
    shiftWindow,
    scaleWindow,
  } = currentWindow;

  // Track the audio playback with the spectrogram
  useEffect(() => {
    if (state.playing && trackAudio) {
      centerOn({
        time: state.time,
      });
    }
  }, [state.playing, state.time, centerOn, trackAudio]);

  // This hook allows the user to drag the spectrogram around
  const [dragRef, dragState] = useScratch();
  useWindowDrag({
    window: specWindow,
    setWindow: setWindow,
    active: spectrogramState.canDrag,
    dragState,
  });

  // This hook allows the user to move the spectrogram around with wheel
  // events
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollState = useMouseWheel(scrollRef);

  useWindowScroll({
    shiftWindow: shiftWindow,
    active: canScroll,
    scrollState,
  });

  useWindowZoom({
    active: canZoom,
    scaleWindow: scaleWindow,
    scrollState,
  });

  const { draw: drawBBox } = useBBoxZoom({
    window: specWindow,
    setWindow: setWindow,
    dimensions: {
      width: scrollRef.current?.offsetWidth ?? 0,
      height: scrollRef.current?.offsetHeight ?? 0,
    },
    drag: dragState,
    active: spectrogramState.canBBoxZoom,
    onZoom: () => {
      setSpectrogramState((state) => ({
        ...state,
        canDrag: true,
        canBBoxZoom: false,
      }));
    },
  });

  // Blend the user's draw function with the spectrogram's draw function
  const onDraw = useCallback(
    (ctx: CanvasRenderingContext2D, window: SpectrogramWindow) => {
      drawBBox(ctx);
      Object.values(drawingFunctions).forEach((fn) => fn(ctx, window));
    },
    [drawBBox, drawingFunctions],
  );

  // This hook draws the spectrogram to the canvas
  const { canvas } = useSpectrogramCanvas({
    recording,
    window: specWindow,
    parameters: settings.parameters,
    currentTime: state.time,
    onDraw: onDraw,
  });

  // Create html elements for the player, spectrogram, and settings menu
  const PlayerInstance = (
    <Player audio={audio} controls={controls} state={state} />
  );

  const SettingsMenu = (
    <SpectrogramSettings
      settings={settings.parameters}
      onChange={settings.set}
      onClear={settings.clear}
    />
  );

  const Spectrogram = (
    <div ref={scrollRef} className="w-max-fit h-max-fit w-full h-full">
      <div
        ref={dragRef}
        className="select-none w-max-fit h-max-fit w-full h-full rounded-lg overflow-hidden"
      >
        {canvas}
      </div>
    </div>
  );

  const SpectrogramControlsInstance = (
    <SpectrogramControls
      isDragging={spectrogramState.canDrag && !spectrogramState.frozen}
      isZooming={spectrogramState.canBBoxZoom && !spectrogramState.frozen}
      onDrag={() => {
        if (!spectrogramState.frozen) {
          setSpectrogramState((state) => ({
            ...state,
            canDrag: true,
            canBBoxZoom: false,
          }));
        }
      }}
      onZoom={() => {
        if (!spectrogramState.frozen) {
          setSpectrogramState((state) => ({
            ...state,
            canDrag: false,
            canBBoxZoom: true,
          }));
        }
      }}
      onReset={() => {
        if (!spectrogramState.frozen) {
          currentWindow.reset();
        }
      }}
    />
  );

  return {
    elements: {
      Player: PlayerInstance,
      Spectrogram,
      SettingsMenu,
      SpectrogramControls: SpectrogramControlsInstance,
    },
    state: {
      parameters: settings,
      audio: state,
      scroll: scrollState,
      drag: dragState,
      window: currentWindow.window,
      spectrogram: spectrogramState,
    },
    controls: {
      drawing: {
        add: setDrawingFunctions,
        set: setAllDrawingFunctions,
        remove: removeDrawingFunction,
        clear: resetDrawingFunctions,
      },
      spectrogram: {
        set: setSpectrogramState,
      },
      window: {
        reset: currentWindow.reset,
        set: setWindow,
        scale: scaleWindow,
        shift: shiftWindow,
        center: centerOn,
      },
    },
  } as const;
}
