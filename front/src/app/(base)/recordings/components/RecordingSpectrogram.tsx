import { useRef, useCallback } from "react";
import { useMemo } from "react";
import { useScratch } from "react-use";
import useCanvas from "@/hooks/useCanvas";
import useMouseWheel from "@/hooks/useMouseWheel";
import useSpectrogram from "@/hooks/useSpectrogram";

import Card from "@/components/Card";
import Player from "@/components/Player";
import ScrollBar from "@/components/ScrollBar";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import SpectrogramControls from "@/components/SpectrogramControls";

import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";

export default function RecordingSpectrogram({
  recording,
}: {
  recording: Recording;
}) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track the user's mouse drag
  const [dragRef, dragState] = useScratch();

  // Track the user's mouse scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollState = useMouseWheel(scrollRef);

  // These are the absolute bounds of the spectrogram
  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate],
  );

  // This is the initial viewport of the spectrogram
  const initial = useMemo(
    () => ({
      time: { min: 0, max: Math.min(5, recording.duration) },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.samplerate, recording.duration],
  );

  const { state, send, audioSend, audioState, settings, draw } = useSpectrogram(
    {
      bounds,
      initial,
      recording,
      dragState,
      scrollState,
      scrollRef,
    },
  );

  const handleOnBarDrag = useCallback(
    (newWindow: SpectrogramWindow) => {
      send({ type: "PAN_TO", window: newWindow });
    },
    [send],
  );

  const handleOnBarScroll = useCallback(
    (shiftBy: { time: number; freq: number }, relative: boolean) => {
      send({ type: "SHIFT_WINDOW", shiftBy, relative });
    },
    [send],
  );

  useCanvas({
    ref: canvasRef,
    draw,
  });

  return (
    <Card>
      <div className="flex flex-row gap-2">
        <SpectrogramControls
          isDragging={state.matches("panning")}
          isZooming={state.matches("zooming")}
          onDrag={() => send("PAN")}
          onZoom={() => send("ZOOM")}
          onReset={() => send("RESET")}
        />
        <SpectrogramSettings
          settings={settings.parameters}
          onChange={settings.set}
          onClear={settings.clear}
        />
        <Player
          samplerate={recording.samplerate}
          currentTime={audioState.context.currentTime}
          startTime={audioState.context.startTime}
          endTime={audioState.context.endTime}
          speed={audioState.context.speed}
          loop={audioState.context.loop}
          playing={state.matches("playing")}
          paused={!state.matches("playing")}
          play={() => send("PLAY")}
          pause={() => send("PAUSE")}
          seek={(time: number) => audioSend({ type: "SEEK", time })}
          setSpeed={(speed: number) => audioSend({ type: "SET_SPEED", speed })}
          toggleLoop={() => audioSend({ type: "TOGGLE_LOOP" })}
        />
      </div>
      <div className="h-96">
        <div ref={scrollRef} className="w-max-fit h-max-fit w-full h-full">
          <div
            ref={dragRef}
            className="select-none w-max-fit h-max-fit w-full h-full rounded-lg overflow-hidden"
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>
      </div>
      <ScrollBar
        window={state.context.window}
        bounds={state.context.bounds}
        setWindow={handleOnBarDrag}
        shiftWindow={handleOnBarScroll}
      />
    </Card>
  );
}
