import Loading from "@/app/loading";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import useRecording from "@/hooks/useRecording";
import useAnnotate from "@/hooks/useAnnotate";
import ScrollBar from "@/components/ScrollBar";
import { type Recording } from "@/api/recordings";
import { type Task } from "@/api/tasks";
import Button from "@/components/Button";
import {
  AnnotationProjectIcon,
  DeleteIcon,
  SelectIcon,
} from "@/components/icons";
import RecordingTagBar from "@/app/(base)/recordings/components/RecordingTagBar";

import useTask from "@/hooks/useTask";

type AnnotationState = {
  active: boolean;
  mode: "draw" | "delete" | "select" | "edit";
};

function AnnotationControls({
  annotationState,
  setAnnotationState,
}: {
  annotationState: AnnotationState;
  setAnnotationState: (state: AnnotationState) => void;
}) {
  return (
    <div className="flex space-x-2">
      <Button
        variant={
          annotationState.active && annotationState.mode == "draw"
            ? "primary"
            : "secondary"
        }
        onClick={() => {
          setAnnotationState({
            ...annotationState,
            active: true,
            mode: "draw",
          });
        }}
      >
        <AnnotationProjectIcon className="w-5 h-5" />
      </Button>
      <Button
        variant={
          annotationState.active && annotationState.mode == "select"
            ? "primary"
            : "secondary"
        }
        onClick={() => {
          setAnnotationState({
            ...annotationState,
            active: true,
            mode: "select",
          });
        }}
      >
        <SelectIcon className="w-5 h-5" />
      </Button>
      <Button
        variant={
          annotationState.active && annotationState.mode == "delete"
            ? "danger"
            : "secondary"
        }
        onClick={() => {
          setAnnotationState({
            ...annotationState,
            active: true,
            mode: "delete",
          });
        }}
      >
        <DeleteIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}

function TaskSpectrogram({
  task,
  recording,
}: {
  task: Task;
  recording: Recording;
}) {
  const { spectrogram, bounds } = useAnnotate({
    task,
    recording,
  });

  return (
    <>
      <RecordingTagBar label="Recording tags" recording={recording} />
      <Card>
        <div className="flex flex-row gap-8">
          <div className="flex flex-row gap-2">
            {SpectrogramControls}
            {SettingsMenu}
          </div>
          <AnnotationControls
            annotationState={{
              active: false,
              mode: "draw",
            }}
            setAnnotationState={() => null}
          />
          {Player}
        </div>
        <div className="h-96">{Spectrogram}</div>
        <ScrollBar
          window={window}
          bounds={bounds}
          setWindow={setWindow}
          shiftWindow={shiftWindow}
        />
      </Card>
    </>
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
