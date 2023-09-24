import { useActor } from "@xstate/react";
import { useCallback, useRef } from "react";
import { type StateFrom, type EventFrom } from "xstate";

import { annotateMachine } from "@/machines/annotate";
import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Task } from "@/api/tasks";
import { type Annotation } from "@/api/annotations";
import Card from "@/components/Card";
import Player from "@/components/Player";
import ScrollBar from "@/components/ScrollBar";
import SpectrogramControls from "@/components/SpectrogramControls";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import SpectrogramTags from "@/components/SpectrogramTags";
import AnnotationControls from "@/components/annotation/AnnotationControls";
import useAnnotate from "@/hooks/annotation/useAnnotate";
import useCanvas from "@/hooks/draw/useCanvas";
import useMouseWheel from "@/hooks/motions/useMouseWheel";
import useScratch from "@/hooks/motions/useScratch";
import { useMouse } from "@/hooks/motions/useMouse";
import api from "@/app/api";

export default function TaskSpectrogram({
  state,
  send,
  task,
  recording,
  annotations,
}: {
  state: StateFrom<typeof annotateMachine>;
  send: (event: EventFrom<typeof annotateMachine>) => void;
  task: Task;
  recording: Recording;
  annotations: Annotation[];
}) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track the user's mouse scroll
  const dragState = useScratch({
    ref: canvasRef,
  });
  const scrollState = useMouseWheel(canvasRef);
  const mouseState = useMouse(canvasRef);

  const { draw, tags } = useAnnotate({
    state,
    send,
    recording,
    scratchState: dragState,
    scrollState,
    mouseState,
    annotations,
    ref: canvasRef,
  });
  const [specState, specSend] = useActor(state.context.spectrogram);
  const [audioState, audioSend] = useActor(specState.context.audio);

  const handleOnBarDrag = useCallback(
    (newWindow: SpectrogramWindow) => {
      send({ type: "IDLE" });
      specSend("PAN");
      specSend({ type: "PAN_TO", window: newWindow });
    },
    [specSend, send],
  );

  const handleOnBarScroll = useCallback(
    (shiftBy: { time: number; freq: number }, relative: boolean) => {
      specSend({ type: "SHIFT_WINDOW", shiftBy, relative });
    },
    [specSend],
  );

  useCanvas({ ref: canvasRef, draw });

  return (
    <Card>
      <div className="flex flex-row gap-8">
        <div className="flex flex-row gap-2">
          <SpectrogramControls
            isDragging={state.matches("idle") && specState.matches("panning")}
            isZooming={state.matches("idle") && specState.matches("zooming")}
            onDrag={() => {
              send({ type: "IDLE" });
              specSend("PAN");
            }}
            onZoom={() => {
              send({ type: "IDLE" });
              specSend("ZOOM");
            }}
            onReset={() => {
              send({ type: "IDLE" });
              specSend("RESET");
            }}
          />
          <SpectrogramSettings
            settings={specState.context.parameters}
            onChange={(key, value) =>
              specSend({ type: "SET_PARAMETER", key, value })
            }
            onClear={(key) => specSend({ type: "CLEAR_PARAMETER", key })}
          />
        </div>
        <AnnotationControls
          isDrawing={state.matches("create")}
          isDeleting={state.matches("delete")}
          isSelecting={state.matches("edit.selecting")}
          isEditing={state.matches("edit.editing")}
          geometryType={state.context.geometryType}
          onDraw={() => send({ type: "DRAW" })}
          onDelete={() => send({ type: "DELETE" })}
          onSelect={() => send({ type: "SELECT" })}
          onSelectGeometryType={(type) =>
            send({ type: "SELECT_GEOMETRY_TYPE", geometryType: type })
          }
        />
        <Player
          samplerate={recording.samplerate}
          currentTime={audioState.context.currentTime}
          startTime={audioState.context.startTime}
          endTime={audioState.context.endTime}
          speed={audioState.context.speed}
          loop={audioState.context.loop}
          playing={state.matches("idle") && specState.matches("playing")}
          play={() => {
            send({ type: "IDLE" });
            specSend("PLAY");
          }}
          pause={() => {
            specSend("PAUSE");
            send({ type: "IDLE" });
          }}
          seek={(time: number) => audioSend({ type: "SEEK", time })}
          setSpeed={(speed: number) => audioSend({ type: "SET_SPEED", speed })}
          toggleLoop={() => audioSend({ type: "TOGGLE_LOOP" })}
        />
      </div>
      <div className="h-96">
        <SpectrogramTags
          tags={tags}
          filter={{
            project__eq: task.project_id,
          }}
          onCreate={(tag) => {
            api.annotation_projects.addTag(task.project_id, tag.id);
          }}
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </SpectrogramTags>
      </div>
      <ScrollBar
        window={specState.context.window}
        bounds={specState.context.bounds}
        setWindow={handleOnBarDrag}
        shiftWindow={handleOnBarScroll}
      />
    </Card>
  );
}
