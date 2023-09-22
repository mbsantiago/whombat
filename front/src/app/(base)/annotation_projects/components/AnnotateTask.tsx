import { useActor } from "@xstate/react";
import { notFound } from "next/navigation";
import { useCallback, useRef } from "react";

import { type Recording } from "@/api/recordings";
import { type SpectrogramWindow } from "@/api/spectrograms";
import { type Task } from "@/api/tasks";
import Loading from "@/app/loading";
import Card from "@/components/Card";
import Player from "@/components/Player";
import ScrollBar from "@/components/ScrollBar";
import SpectrogramControls from "@/components/SpectrogramControls";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import SpectrogramTags from "@/components/SpectrogramTags";
import useAnnotate from "@/hooks/annotation/useAnnotate";
import useRecording from "@/hooks/api/useRecording";
import useTask from "@/hooks/api/useTask";
import useCanvas from "@/hooks/draw/useCanvas";
import useMouseWheel from "@/hooks/motions/useMouseWheel";
import useScratch from "@/hooks/motions/useScratch";
import { useMouse } from "@/hooks/motions/useMouse";
import api from "@/app/api";

import AnnotationControls from "./AnnotationControls";

function TaskSpectrogram({
  task,
  recording,
}: {
  task: Task;
  recording: Recording;
}) {
  // Reference to the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track the user's mouse scroll
  const dragState = useScratch({
    ref: canvasRef,
  });
  const scrollState = useMouseWheel(canvasRef);
  const mouseState = useMouse(canvasRef);

  const { state, send, draw, tags } = useAnnotate({
    task,
    recording,
    scratchState: dragState,
    scrollState,
    mouseState,
    ref: canvasRef,
  });
  const [specState, specSend] = useActor(state.context.spectrogram);
  const [audioState, audioSend] = useActor(specState.context.audio);

  const handleOnBarDrag = useCallback(
    (newWindow: SpectrogramWindow) => {
      send("IDLE");
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
              send("IDLE");
              specSend("PAN");
            }}
            onZoom={() => {
              send("IDLE");
              specSend("ZOOM");
            }}
            onReset={() => {
              send("IDLE");
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
          onDraw={() => send("DRAW")}
          onDelete={() => send("DELETE")}
          onSelect={() => send("SELECT")}
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
          paused={!state.matches("idle") || !specState.matches("playing")}
          play={() => {
            send("IDLE");
            specSend("PLAY");
          }}
          pause={() => {
            specSend("PAUSE");
            send("IDLE");
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

export default function AnnotateTask({ task_id }: { task_id: number }) {
  // Get information about the task
  const task = useTask({ task_id });
  const { recording_id } = task.query.data?.clip ?? {};

  // Get info about the recording
  const recording = useRecording({
    recording_id: recording_id ?? -1,
    enabled: recording_id != null,
  });

  if (task.query.isLoading || recording.query.isLoading) {
    return <Loading />;
  }

  if (task.query.data == null || recording.query.data == null) {
    return notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <TaskSpectrogram
        task={task.query.data}
        recording={recording.query.data}
      />
    </div>
  );
}
