import { useState } from "react";
import AnnotationTaskBase from "@/lib/components/annotation/AnnotationTask";
import AnnotationTaskStatus from "@/app/components/annotation_tasks/AnnotationTaskStatus";
import AnnotationProgress from "./AnnotationProgress";
import AnnotationContext from "./AnnotationContext";
import AnnotationTagPalette from "./AnnotationTagPalette";
import ClipAnnotationTags from "../clip_annotations/ClipAnnotationTags";
import ClipAnnotationNotes from "../clip_annotations/ClipAnnotationNotes";
import type { AnnotationProject, AnnotationTask, Tag } from "@/lib/types";
import useAnnotationTask from "@/app/hooks/api/useAnnotationTask";

export default function AnnotateTasks({
  annotationProject,
  annotationTask,
}: {
  annotationProject: AnnotationProject;
  annotationTask?: AnnotationTask;
}) {
  const [task, setTask] = useState<AnnotationTask | null>(
    annotationTask || null,
  );

  const [tagsPalette, setTagsPalette] = useState<Tag[]>([]);

  const {
    clipAnnotation: { data: clipAnnotation },
  } = useAnnotationTask({
    uuid: task?.uuid || "",
    annotationTask: task || undefined,
    withAnnotations: true,
    enabled: task != null,
  });

  return (
    <AnnotationTaskBase
      selectedTask={task}
      AnnotationTaskStatus={
        task != null ? <AnnotationTaskStatus task={task} /> : undefined
      }
      AnnotationProgress={
        <AnnotationProgress
          selectedTask={task}
          annotationProject={annotationProject}
          onSelectAnnotationTask={setTask}
        />
      }
      AnnotationContext={
        task != null ? <AnnotationContext task={task} /> : undefined
      }
      AnnotationTagPalette={
        <AnnotationTagPalette
          tags={tagsPalette}
          clipAnnotation={clipAnnotation}
          onTagsChange={setTagsPalette}
        />
      }
      AnnotationTaskTags={
        clipAnnotation != null ? (
          <ClipAnnotationTags clipAnnotation={clipAnnotation} />
        ) : undefined
      }
      AnnotationTaskNotes={
        clipAnnotation != null ? (
          <ClipAnnotationNotes clipAnnotation={clipAnnotation} />
        ) : undefined
      }
    />
  );
}

// const [selectedAnnotation, setSelectedAnnotation] =
//   useState<SoundEventAnnotation | null>(null);
// const [tagPalette, setTagPalette] = useState<Tag[]>([]);
//
// const tasks = useAnnotationTasks({
//   filter: taskFilter,
//   annotationTask: annotationTask,
//   onChangeTask,
//   onCompleteTask,
//   onRejectTask,
//   onVerifyTask,
// });
//
// const { data: clipAnnotation, isLoading: isLoadingClipAnnotation } =
//   tasks.annotations;
//
// const { data, addTag, removeTag, addNote, removeNote } = useClipAnnotation({
//   uuid: clipAnnotation?.uuid,
//   clipAnnotation,
//   onAddTag: onAddClipTag,
//   onRemoveTag: onRemoveClipTag,
//   enabled: clipAnnotation != null,
// });
//
// const onClearTags = useCallback(async () => {
//   const tags = clipAnnotation?.tags?.slice(0);
//   if (tags == null) return;
//   for (const tag of tags) {
//     await removeTag.mutateAsync(tag);
//   }
// }, [clipAnnotation, removeTag]);
//
// const handleAddTagToPalette = useCallback((tag: Tag) => {
//   setTagPalette((tags) => {
//     if (tags.some((t) => t.key === tag.key && t.value === tag.value)) {
//       return tags;
//     }
//     return [...tags, tag];
//   });
// }, []);
//
// const handleRemoveTagFromPalette = useCallback((tag: Tag) => {
//   setTagPalette((tags) => {
//     return tags.filter((t) => t.key !== tag.key || t.value !== tag.value);
//   });
// }, []);
//
// const handleClearTagPalette = useCallback(() => {
//   setTagPalette([]);
// }, []);
//
// if (tasks.isLoading) {
//   return <Loading />;
// }
//
// if (tasks.isError) {
//   return <div>Error loading annotation tasks</div>;
// }
//
// if (tasks.task == null) {
//   return <Empty>No tasks available</Empty>;
// }
