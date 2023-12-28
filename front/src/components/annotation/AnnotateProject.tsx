import { useMemo } from "react";
import AnnotateClip from "@/components/annotation/AnnotateClip";
import Empty from "@/components/Empty";
import Loading from "@/components/Loading";
import type {
  AnnotationProject,
  SoundEventAnnotation,
  ClipAnnotation,
  AnnotationTask,
  Tag,
  User,
} from "@/api/schemas";
import useAnnotation from "@/hooks/annotation/useAnnotation";
import {
  type SpectrogramParameters,
  DEFAULT_SPECTROGRAM_PARAMETERS,
} from "@/api/spectrograms";
import AnnotationProgress from "@/components/annotation/AnnotationProgress";
import AnnotationTaskStatus from "@/components/annotation_tasks/AnnotationTaskStatus";

export default function AnnotateProject({
  annotationProject,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  annotationTask,
  currentUser,
  onCreateSoundEventAnnotation,
  onUpdateSoundEventAnnotation,
  onAddSoundEventTag,
  onRemoveSoundEventTag,
  onDeleteSoundEventAnnotation,
  onChangeTask,
  onAddClipTag,
  onRemoveClipTag,
  onAddStatusBadge,
  onRemoveStatusBadge,
  onParameterSave,
}: {
  annotationProject: AnnotationProject;
  parameters?: SpectrogramParameters;
  annotationTask?: AnnotationTask;
  currentUser: User;
  onCreateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onUpdateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddSoundEventTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  onRemoveSoundEventTag?: (annotation: SoundEventAnnotation, tag: Tag) => void;
  onDeleteSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onChangeTask?: (annotationTask: AnnotationTask) => void;
  onAddClipTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  onRemoveClipTag?: (annotation: ClipAnnotation, tag: Tag) => void;
  onAddStatusBadge?: (task: AnnotationTask) => void;
  onRemoveStatusBadge?: (task: AnnotationTask) => void;
  onParameterSave?: (parameters: SpectrogramParameters) => void;
}) {
  const initalFilter = useMemo(
    () => ({
      annotation_project__eq: annotationProject.uuid,
    }),
    [annotationProject.uuid],
  );

  const tagFilter = useMemo(
    () => ({
      annotation_project__eq: annotationProject.uuid,
    }),
    [annotationProject.uuid],
  );

  const tasks = useAnnotation({
    filter: initalFilter,
    annotationTask: annotationTask,
    onChangeTask: onChangeTask,
  });

  if (tasks.isLoading) {
    return <Loading />;
  }

  if (tasks.isError) {
    return <div>Error loading annotation tasks</div>;
  }

  if (tasks.task == null) {
    return <Empty>No tasks available</Empty>;
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <AnnotationProgress
        tasks={tasks.tasks}
        filter={tasks._filter}
        onNext={tasks.nextTask}
        onPrevious={tasks.prevTask}
      />
      {tasks.task != null && (
        <AnnotationTaskStatus
          task={tasks.task}
          onReview={tasks.markRejected.mutate}
          onDone={tasks.markCompleted.mutate}
          onVerify={tasks.markVerified.mutate}
          onRemoveBadge={tasks.removeBadge.mutate}
        />
      )}
      <div>
        {tasks.annotations.isLoading ? (
          <Loading />
        ) : tasks.annotations.data == null ? (
          <NoClipSelected />
        ) : (
          <AnnotateClip
            parameters={parameters}
            tagFilter={tagFilter}
            currentUser={currentUser}
            clipAnnotation={tasks.annotations.data}
            onCreateSoundEventAnnotation={onCreateSoundEventAnnotation}
            onAddSoundEventTag={onAddSoundEventTag}
            onUpdateSoundEventAnnotation={onUpdateSoundEventAnnotation}
            onRemoveSoundEventTag={onRemoveSoundEventTag}
            onDeleteSoundEventAnnotation={onDeleteSoundEventAnnotation}
            onAddClipTag={onAddClipTag}
            onRemoveClipTag={onRemoveClipTag}
            onParameterSave={onParameterSave}
          />
        )}
      </div>
    </div>
  );
}

function NoClipSelected() {
  return <Empty>No clip selected</Empty>;
}
