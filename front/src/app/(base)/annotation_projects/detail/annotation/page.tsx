"use client";
import { useContext } from "react";
import toast from "react-hot-toast";

import useRecording from "@/hooks/api/useRecording";
import useAnnotationTasks from "@/hooks/annotation/useAnnotationTasks";
import useTask from "@/hooks/api/useTask";
import useStateParams from "@/hooks/useStateParams";
import AnnotationProgress from "@/components/annotation/AnnotationProgress";
import Empty from "@/components/Empty";
import Loading from "@/app/loading";
import AnnotateTask from "@/components/annotation/AnnotateTask";
import { AnnotationProjectContext } from "@/app/contexts";
import { CompleteIcon } from "@/components/icons";

export default function Page() {
  const project = useContext(AnnotationProjectContext);

  // Load annotation tasks for this project
  const { isLoading, filter, total, complete, pending, refresh, current } =
    useAnnotationTasks({
      project,
    });

  // Get task_id from URL
  const [task_id] = useStateParams(
    current?.id,
    "task_id",
    (value: number) => value.toString(),
    (value: string) => parseInt(value, 10),
  );

  // Get information about the task
  const task = useTask({
    task_id: task_id,
    onAddBadge: (state) => {
      switch (state) {
        case "completed":
          toast.success("Task done!");
          break;
        case "rejected":
          toast.success("Task set for review");
          break;
        case "verified":
          toast.success("Task verified!");
          break;
        default:
          break;
      }
      refresh();
    },
  });

  // Get information about the recording
  const recording = useRecording({
    recording_id: task.query.data?.clip.recording_id ?? -1,
    enabled: task.query.data != null,
  });

  if (isLoading || task_id == null) {
    return <Loading />;
  }

  if (total === 0) {
    return (
      <Empty>
        No task available. Please add more tasks to this project to continue
        annotating.
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnnotationProgress
        complete={complete}
        filter={filter}
        pending={pending}
      />
      {current == null ? (
        <Empty>
          <div>
            <CompleteIcon className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-lg font-medium">Congratulations!</p>
          <p>
            You have completed all tasks in this project. Add additional tasks
            to continue annotating.
          </p>
        </Empty>
      ) : recording.query.isLoading ||
        task.query.isLoading ||
        recording.query.data == null ||
        task.query.data == null ? (
        <Loading />
      ) : (
        <AnnotateTask
          project={project}
          task={task.query.data}
          recording={recording.query.data}
          addBadge={task.addBadge.mutate}
          removeBadge={task.removeBadge.mutate}
        />
      )}
    </div>
  );
}
