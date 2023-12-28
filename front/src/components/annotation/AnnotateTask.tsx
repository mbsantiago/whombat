import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";

import { type Tag } from "@/api/schemas";
import { type AnnotationStatus, type AnnotationTask } from "@/api/schemas";
import { type SoundEventAnnotation, type AnnotationTag } from "@/api/schemas";
import { type Geometry } from "@/api/schemas";
import { type AnnotationProject } from "@/api/schemas";
import { type SpectrogramParameters } from "@/api/spectrograms";
import Loading from "@/app/loading";
import RecordingHeader from "@/components/recordings/RecordingHeader";
import RecordingTagBar from "@/components/recordings/RecordingTagBar";
import TaskSpectrogram from "@/components/spectrograms/TaskSpectrogram";
import AnnotationProjectTags from "@/components/annotation/AnnotationTags";
// import TaskStatus from "@/components/tasks/TaskStatus";
// import useTask from "@/hooks/api/useTask";
// import useSoundEventAnnotations from "@/hooks/api/useAnnotations";

export default function AnnotateTask({
  task_id,
  project,
  tags,
  parameters,
  addTag,
  removeTag,
  clearTags,
  refresh,
}: {
  task_id: number;
  project: AnnotationProject;
  tags: Tag[];
  parameters: SpectrogramParameters;
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

  // Get info about the task annotations
  const filter = useMemo(() => ({ task__eq: task_id }), [task_id]);
  const annotations = useSoundEventAnnotations({ filter });


  const { mutateAsync: addTagAsync } = annotations.addTag;
  const onAddAnnotationTag = useCallback(
    async (annotation: SoundEventAnnotation, tag: Tag) => {
      return await toast.promise(
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
    async (annotation: SoundEventAnnotation, tag: AnnotationTag) => {
      return await toast.promise(
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
      // Use the current tags if none are provided
      if (tag_ids == null) {
        tag_ids = tags.map((tag) => tag.id);
      }
      return await toast.promise(
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
    async (annotation: SoundEventAnnotation, geometry: Geometry) => {
      return await toast.promise(
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
    async (annotation: SoundEventAnnotation) => {
      return await toast.promise(deleteAnnotationAsync(annotation.id), {
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
          {task.query.isLoading || task.query.data == null ? (
            <Loading />
          ) : (
            <RecordingHeader recording={task.query.data.clip.recording} />
          )}
        </div>
        <div className="grow">
          <RecordingTagBar
            tags={task.query.data?.clip.recording.tags ?? []}
            label="Recording Tags"
            onClick={(tag) => addTag(tag)}
          />
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div className="grow flex flex-col gap-3">
          {task.query.isLoading ||
          task.query.data == null
          ? (
            <Loading />
          ) : (
            <TaskSpectrogram
              task={task.query.data}
              annotations={annotations.items}
              recording={task.query.data.clip.recording}
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
          <AnnotationProjectTags
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
