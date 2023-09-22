import { useCallback, useRef } from "react";
import { useMemo } from "react";
import { useActor, useMachine } from "@xstate/react";

import { spectrogramMachine } from "@/machines/spectrogram";
import useCanvas from "@/hooks/draw/useCanvas";
import useMouseWheel from "@/hooks/motions/useMouseWheel";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useScratch from "@/hooks/motions/useScratch";
import useStore from "@/store";
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

  const scrollState = useMouseWheel(canvasRef);
  const dragState = useScratch({ ref: canvasRef });

  // Get initial spectrogram parameters from global state
  const parameters = useStore((state) => state.spectrogramSettings);

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

  // This hook holds the state for the spectrogram settings
  // State machine for the spectrogram
  const [state, send] = useMachine(spectrogramMachine, {
    context: {
      recording,
      bounds,
      initial,
      window: initial,
      parameters,
    },
  });

  const { draw } = useSpectrogram({
    state,
    send,
    dragState,
    scrollState,
  });

  const [audioState, audioSend] = useActor(state.context.audio);

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

  useCanvas({ ref: canvasRef, draw });

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
          settings={state.context.parameters}
          onChange={(key, value) => send({ type: "SET_PARAMETER", key, value })}
          onClear={(key) => send({ type: "CLEAR_PARAMETER", key })}
        />
        <Player
          samplerate={recording.samplerate}
          currentTime={audioState.context.currentTime}
          startTime={audioState.context.startTime}
          endTime={audioState.context.endTime}
          speed={audioState.context.speed}
          loop={audioState.context.loop}
          playing={state.matches("playing")}
          play={() => send("PLAY")}
          pause={() => send("PAUSE")}
          seek={(time: number) => audioSend({ type: "SEEK", time })}
          setSpeed={(speed: number) => audioSend({ type: "SET_SPEED", speed })}
          toggleLoop={() => audioSend({ type: "TOGGLE_LOOP" })}
        />
      </div>
      <div className="h-96">
        <canvas ref={canvasRef} className="w-full h-full" />
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
