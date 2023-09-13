import { useMemo, useRef, useEffect } from "react";
import { useScratch } from "react-use";
import useSpectrogramCanvas from "@/hooks/useSpectrogramCanvas";
import useSpectrogramParameters from "@/hooks/useSpectrogramParameters";
import useMouseWheel from "@/hooks/useMouseWheel";
import useAudio from "@/hooks/useAudio";
import useWindowDrag from "@/hooks/useWindowDrag";
import useWindowScroll from "@/hooks/useWindowScroll";
import useWindowZoom from "@/hooks/useWindowZoom";
import useWindow from "@/hooks/useWindow";
import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";
import Player from "@/components/Player";
import SpectrogramSettings from "@/components/SpectrogramSettings";

/* This hook provides all the basic spectrogram functionality, including
 * playback, dragging, scrolling, and settings.
 */
export default function useSpectrogram({
  bounds,
  recording,
  canDrag = true,
  canScroll = true,
  canZoom = true,
  trackAudio = true,
  onDraw,
}: {
  bounds: SpectrogramWindow;
  recording: Recording;
  canDrag?: boolean;
  canScroll?: boolean;
  canZoom?: boolean;
  trackAudio?: boolean;
  onDraw?: (ctx: CanvasRenderingContext2D, window: SpectrogramWindow) => void;
}) {
  const settings = useSpectrogramParameters({
    recording,
  });

  const { audio, controls, state } = useAudio({
    recording,
    speed: recording.samplerate > 96000 ? 44100 / recording.samplerate : 1,
  });

  // This is the initial viewport of the spectrogram
  const initial = useMemo(
    () => ({
      time: { min: 0, max: Math.min(5, recording.duration) },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.samplerate, recording.duration],
  );

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
    active: canDrag,
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
  })

  // This hook draws the spectrogram to the canvas
  const { canvas } = useSpectrogramCanvas({
    recording,
    window: specWindow,
    parameters: settings.parameters,
    currentTime: state.time,
    onDraw,
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
        className="select-none h-96 w-max-fit h-max-fit w-full rounded-lg overflow-hidden"
      >
        {canvas}
      </div>
    </div>
  );

  return {
    elements: {
      Player: PlayerInstance,
      Spectrogram,
      SettingsMenu,
    },
    state: {
      spectrogram: settings,
      audio: state,
      scroll: scrollState,
      drag: dragState,
      window: currentWindow,
    },
  } as const;
}
