import { useCallback, useEffect, useRef } from "react";
import { useMemo } from "react";
import { useActor, useMachine } from "@xstate/react";
import classNames from "classnames";

import { computeGeometryBBox } from "@/utils/geometry";
import { spectrogramMachine } from "@/machines/spectrogram";
import useCanvas from "@/hooks/draw/useCanvas";
import useMouseWheel from "@/hooks/motions/useMouseWheel";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useScratch from "@/hooks/motions/useScratch";
import useAnnotationDraw from "@/hooks/annotation/useAnnotationDraw";
import Player from "@/components/Player";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import SpectrogramControls from "@/components/SpectrogramControls";
import { type Recording } from "@/api/recordings";
import { type Annotation } from "@/api/annotations";
import { type SpectrogramParameters } from "@/api/spectrograms";

const SPEC_WIDTH = 512;

function getBounds(
  annotation: Annotation,
  samplerate: number,
  duration: number,
  hop_size: number,
) {
  // @ts-ignore
  const bbox = computeGeometryBBox(annotation.sound_event.geometry);
  const annotationDuration = bbox[2] - bbox[0];
  const middlePoint = (bbox[0] + bbox[2]) / 2;

  const minDuration = SPEC_WIDTH * hop_size;
  const maxDuration = Math.max(
    Math.min(duration, annotationDuration * 4),
    minDuration,
  );

  const minTime = Math.max(0, middlePoint - maxDuration / 2);
  const maxTime = Math.min(duration, middlePoint + maxDuration / 2);

  const halfDuration = Math.min(middlePoint - minTime, maxTime - middlePoint);
  const halfDurationMin = Math.min(halfDuration, minDuration / 2);

  const bounds = {
    time: {
      min: middlePoint - halfDuration,
      max: middlePoint + halfDuration,
    },
    freq: {
      min: 0,
      max: samplerate / 2,
    },
  };

  const initial = {
    time: {
      min: middlePoint - halfDurationMin,
      max: middlePoint + halfDurationMin,
    },
    freq: {
      min: 0,
      max: samplerate / 2,
    },
  };

  return {
    bounds,
    initial,
  };
}

export default function AnnotationSpectrogram({
  recording,
  annotation,
  parameters,
  controls = true,
  player = true,
  className,
}: {
  recording: Recording;
  annotation: Annotation;
  parameters: SpectrogramParameters;
  controls?: boolean;
  player?: boolean;
  className?: string;
}) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scrollState = useMouseWheel(canvasRef);
  const dragState = useScratch({ ref: canvasRef });

  // Compute the bounds and initial view from the annotation
  const { bounds, initial } = useMemo(
    () =>
      getBounds(
        annotation,
        recording.samplerate,
        recording.duration,
        parameters.hop_size ?? 0.01,
      ),
    [recording.samplerate, recording.duration, annotation, parameters.hop_size],
  );

  const [state, send] = useMachine(spectrogramMachine, {
    context: {
      recording,
      bounds,
      initial,
      window: initial,
      parameters,
    },
  });

  useEffect(() => {
    send({
      type: "UPDATE",
      bounds,
      initial: bounds,
    });
  }, [bounds, send]);

  const { draw: drawSpectrogram } = useSpectrogram({
    state,
    send,
    dragState,
    scrollState,
  });

  const drawAnnotation = useAnnotationDraw({
    window: state.context.window,
    annotations: [annotation],
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawSpectrogram(ctx);
      drawAnnotation(ctx);
    },
    [drawSpectrogram, drawAnnotation],
  );

  const [audioState, audioSend] = useActor(state.context.audio);

  useCanvas({ ref: canvasRef, draw });

  return (
    <>
      <div className={classNames(className, "rounded-md overflow-hidden")}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      {controls || player ? (
        <div className="flex flex-row gap-2">
          {controls ? (
            <>
              <SpectrogramControls
                isDragging={state.matches("panning")}
                isZooming={state.matches("zooming")}
                onDrag={() => send("PAN")}
                onZoom={() => send("ZOOM")}
                onReset={() => send("RESET")}
              />
              <SpectrogramSettings
                settings={state.context.parameters}
                onChange={(key, value) =>
                  send({ type: "SET_PARAMETER", key, value })
                }
                onClear={(key) => send({ type: "CLEAR_PARAMETER", key })}
              />
            </>
          ) : null}
          {player ? (
            <Player
              samplerate={recording.samplerate}
              currentTime={audioState.context.currentTime}
              startTime={audioState.context.startTime}
              endTime={audioState.context.endTime}
              speed={audioState.context.speed}
              loop={audioState.context.loop}
              playing={audioState.matches("playing")}
              play={() => send("PLAY")}
              pause={() => send("PAUSE")}
              seek={(time: number) => audioSend({ type: "SEEK", time })}
              setSpeed={(speed: number) =>
                audioSend({ type: "SET_SPEED", speed })
              }
              toggleLoop={() => audioSend({ type: "TOGGLE_LOOP" })}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
