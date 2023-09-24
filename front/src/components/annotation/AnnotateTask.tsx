import { useState, useCallback } from "react";
import { useMemo } from "react";
import { useMachine } from "@xstate/react";
import toast from "react-hot-toast";

import { annotateMachine, type AddTagEvent } from "@/machines/annotate";
import useStore from "@/store";
import useAnnotations from "@/hooks/api/useAnnotations";
import { type Tag } from "@/api/tags";
import { type Task, type State, type StatusBadge } from "@/api/tasks";
import { type Recording } from "@/api/recordings";
import { type AnnotationProject } from "@/api/annotation_projects";
import RecordingHeader from "@/components/recordings/RecordingHeader";
import RecordingTagBar from "@/components/recordings/RecordingTagBar";
import TaskSpectrogram from "@/components/spectrograms/TaskSpectrogram";
import AnnotationTags from "@/components/annotation/AnnotationTags";
import TaskStatus from "@/components/tasks/TaskStatus";
import TaskTags from "@/components/tasks/TaskTags";

export default function AnnotateTask({
  project,
  task,
  recording,
  addBadge,
  removeBadge,
}: {
  project: AnnotationProject;
  task: Task;
  recording: Recording;
  addBadge: (state: State) => void;
  removeBadge: (badge: StatusBadge) => void;
}) {
  // Get information about the recording
  // Get info about the task annotations
  const filter = useMemo(() => ({ task__eq: task.id }), [task.id]);
  const annotations = useAnnotations({ filter });

  // Get spectrogram settings
  const parameters = useStore((state) => state.spectrogramSettings);

  const [tags, setTags] = useState<Tag[]>([]);

  const onAddTag = useCallback((tag: Tag) => {
    setTags((tags) => (tags.includes(tag) ? tags : [...tags, tag]));
  }, []);

  const onRemoveTag = useCallback((tag: Tag) => {
    setTags((tags) => tags.filter((t) => t.id !== tag.id));
  }, []);

  const onClearTags = useCallback(() => {
    setTags([]);
  }, []);

  const [state, send] = useMachine(annotateMachine, {
    context: {
      task,
      recording,
      tags: [],
      parameters,
      selectedAnnotation: null,
      geometryType: "BoundingBox",
    },
    actions: {
      addTag: async (_, event: AddTagEvent) => {
        const { annotation, tag } = event;
        const updated = annotations.addTag.mutateAsync({
          annotation_id: annotation.id,
          tag_id: tag.id,
        });

        toast.promise(updated, {
          loading: "Adding tag...",
          success: "Tag added",
          error: "Failed to add tag",
        });

        return await updated;
      },
      removeTag: async (_, event: AddTagEvent) => {
        const { annotation, tag } = event;
        const updated = annotations.removeTag.mutateAsync({
          annotation_id: annotation.id,
          tag_id: tag.id,
        });

        toast.promise(updated, {
          loading: "Removing tag...",
          success: "Tag removed",
          error: "Failed to remove tag",
        });

        return await updated;
      },
    },
    services: {
      createAnnotation: async (ctx, event) => {
        const { task } = ctx;
        // @ts-ignore
        const { geometry, tag_ids } = event;

        if (geometry == null) {
          throw new Error("No geometry to create");
        }

        const annotation = annotations.create.mutateAsync({
          task_id: task.id,
          geometry,
          tag_ids,
        });

        toast.promise(annotation, {
          loading: "Creating annotation...",
          success: "Annotation created",
          error: "Failed to create annotation",
        });

        return await annotation;
      },
      updateAnnotationGeometry: async (ctx, event) => {
        const { selectedAnnotation } = ctx;
        // @ts-ignore
        const { geometry } = event;

        if (selectedAnnotation == null) {
          throw new Error("No annotation selected");
        }

        const updated = annotations.update.mutateAsync({
          annotation_id: selectedAnnotation.id,
          data: {
            geometry,
          },
        });

        toast.promise(updated, {
          loading: "Updating annotation...",
          success: "Annotation updated",
          error: "Failed to update annotation",
        });

        return await updated;
      },
      deleteAnnotation: async (_, event) => {
        // @ts-ignore
        const { annotation } = event;

        if (annotation == null) {
          throw new Error("No annotation to delete");
        }

        const deleted = annotations.delete.mutateAsync(annotation.id);

        toast.promise(deleted, {
          loading: "Deleting annotation...",
          success: "Annotation deleted",
          error: "Failed to delete annotation",
        });

        return await deleted;
      },
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-4">
        <div>
          <RecordingHeader recording={recording} />
        </div>
        <div className="grow">
          <RecordingTagBar recording={recording} label="Recording Tags" />
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <div className="grow flex flex-col gap-3">
          <TaskSpectrogram
            state={state}
            send={send}
            task={task}
            recording={recording}
            annotations={annotations.items}
          />
        </div>
        <div className="max-w-sm flex flex-col gap-3">
          <TaskStatus
            task={task}
            done={() => addBadge("completed")}
            review={() => addBadge("rejected")}
            verify={() => addBadge("verified")}
            removeBadge={(badge) => removeBadge(badge)}
          />
          <AnnotationTags
            tags={tags}
            project={project}
            onAddTag={onAddTag}
            onRemoveTag={onRemoveTag}
            onClearTags={onClearTags}
          />
          <TaskTags tags={task.tags} />
        </div>
      </div>
    </div>
  );
}
