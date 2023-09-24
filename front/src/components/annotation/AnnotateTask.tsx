import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";

import { type Tag } from "@/api/tags";
import { type State, type Task } from "@/api/tasks";
import { type Annotation, type AnnotationTag } from "@/api/annotations";
import { type Geometry } from "@/api/sound_events";
import { type AnnotationProject } from "@/api/annotation_projects";
import Loading from "@/app/loading";
import RecordingHeader from "@/components/recordings/RecordingHeader";
import RecordingTagBar from "@/components/recordings/RecordingTagBar";
import TaskSpectrogram from "@/components/spectrograms/TaskSpectrogram";
import AnnotationTags from "@/components/annotation/AnnotationTags";
import TaskStatus from "@/components/tasks/TaskStatus";
import TaskTags from "@/components/tasks/TaskTags";
import useTask from "@/hooks/api/useTask";
import useRecording from "@/hooks/api/useRecording";
import useStore from "@/store";
import useAnnotations from "@/hooks/api/useAnnotations";

export default function AnnotateTask({
  task_id,
  project,
  tags,
  addTag,
  removeTag,
  clearTags,
  refresh,
}: {
  task_id: number;
  project: AnnotationProject;
  tags: Tag[];
  addTag: (tag: Tag) => void;
  removeTag: (tag: Tag) => void;
  clearTags: () => void;
  refresh?: () => void;
}) {
  const onAddBadge = useCallback(
    (state: State) => {
      switch (state) {
        case "completed":
          toast.success("Task completed!");
          break;
        case "rejected":
          toast.success("Task marked for review.");
          break;
        case "verified":
          toast.success("Task verified.");
          break;
        default:
          break;
      }
      refresh?.();
    },
    [refresh],
  );

  // Get task data
  const task = useTask({
    task_id,
    onAddBadge,
  });

  // Get recording data
  const recording = useRecording({
    recording_id: task.query.data?.clip.recording_id ?? -1,
    enabled: task.query.data != null,
  });

  // Get info about the task annotations
  const filter = useMemo(() => ({ task__eq: task_id }), [task_id]);
  const annotations = useAnnotations({ filter });

  // Get spectrogram settings
  const parameters = useStore((state) => state.spectrogramSettings);

  const { mutateAsync: addTagAsync } = annotations.addTag;
  const onAddAnnotationTag = useCallback(
    async (annotation: Annotation, tag: Tag) => {
      await toast.promise(
        addTagAsync({
          annotation_id: annotation.id,
          tag_id: tag.id,
        }),
        {
          loading: "Adding tag...",
          success: "Tag added!",
          error: "Failed to add tag.",
        },
      );
    },
    [addTagAsync],
  );

  const { mutateAsync: removeTagAsync } = annotations.removeTag;
  const onRemoveAnnotationTag = useCallback(
    async (annotation: Annotation, tag: AnnotationTag) => {
      await toast.promise(
        removeTagAsync({
          annotation_id: annotation.id,
          tag_id: tag.id,
        }),
        {
          loading: "Removing tag...",
          success: "Tag removed!",
          error: "Failed to remove tag.",
        },
      );
    },
    [removeTagAsync],
  );

  const { mutateAsync: createAnnotationAsync } = annotations.create;
  const onCreateAnnotation = useCallback(
    async (task: Task, geometry: Geometry, tag_ids?: number[]) => {
      console.log("Creating annotation", task, geometry, tag_ids)
      // Use the current tags if none are provided
      if (tag_ids == null) {
        tag_ids = tags.map((tag) => tag.id);
      }
      await toast.promise(
        createAnnotationAsync({
          task_id: task.id,
          geometry,
          tag_ids,
        }),
        {
          loading: "Creating annotation...",
          success: "Annotation created!",
          error: "Failed to create annotation.",
        },
      );
    },
    [createAnnotationAsync, tags],
  );

  const { mutateAsync: updateAnnotationAsync } = annotations.update;
  const onUpdateAnnotationGeometry = useCallback(
    async (annotation: Annotation, geometry: Geometry) => {
      await toast.promise(
        updateAnnotationAsync({
          annotation_id: annotation.id,
          data: { geometry },
        }),
        {
          loading: "Updating annotation...",
          success: "Annotation updated!",
          error: "Failed to update annotation.",
        },
      );
    },
    [updateAnnotationAsync],
  );

  const { mutateAsync: deleteAnnotationAsync } = annotations.delete;
  const onDeleteAnnotation = useCallback(
    async (annotation: Annotation) => {
      await toast.promise(deleteAnnotationAsync(annotation.id), {
        loading: "Deleting annotation...",
        success: "Annotation deleted!",
        error: "Failed to delete annotation.",
      });
    },
    [deleteAnnotationAsync],
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4">
        <div>
          {recording.query.isLoading || recording.query.data == null ? (
            <Loading />
          ) : (
            <RecordingHeader recording={recording.query.data} />
          )}
        </div>
        <div className="grow">
          <RecordingTagBar
            tags={recording.query.data?.tags ?? []}
            label="Recording Tags"
            onClick={(tag) => addTag(tag)}
          />
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div className="grow flex flex-col gap-3">
          {task.query.isLoading ||
          task.query.data == null ||
          recording.query.isLoading ||
          recording.query.data == null ? (
            <Loading />
          ) : (
            <TaskSpectrogram
              task={task.query.data}
              annotations={annotations.items}
              recording={recording.query.data}
              parameters={parameters}
              onAddTag={onAddAnnotationTag}
              onRemoveTag={onRemoveAnnotationTag}
              onCreateAnnotation={onCreateAnnotation}
              onUpdateAnnotationGeometry={onUpdateAnnotationGeometry}
              onDeleteAnnotation={onDeleteAnnotation}
            />
          )}
        </div>
        <div className="max-w-sm flex flex-col gap-3">
          <TaskStatus
            task={task.query.data}
            done={() => task.addBadge.mutate("completed")}
            review={() => task.addBadge.mutate("rejected")}
            verify={() => task.addBadge.mutate("verified")}
            removeBadge={(badge) => task.removeBadge.mutate(badge)}
          />
          <AnnotationTags
            tags={tags}
            project={project}
            onClick={task.addTag.mutate}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onClearTags={clearTags}
          />
          <TaskTags
            tags={task.query.data?.tags ?? []}
            onAddTag={task.addTag.mutate}
            onRemoveTag={task.removeTag.mutate}
          />
        </div>
      </div>
    </div>
  );
}
