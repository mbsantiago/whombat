import { useCallback, useState } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/lib/api/spectrograms";
import AnnotationProgress from "@/lib/components/annotation/AnnotationProgress";
import AnnotationTagPalette from "@/lib/components/annotation/AnnotationTagPalette";
import RecordingAnnotationContext from "@/lib/components/annotation/RecordingAnnotationContext";
import SelectedSoundEventAnnotation from "@/lib/components/annotation/SelectedSoundEventAnnotation";
import AnnotationTaskStatus from "@/lib/components/annotation_tasks/AnnotationTaskStatus";
import ClipAnnotationNotes from "@/lib/components/clip_annotations/ClipAnnotationNotes";
import ClipAnnotationSpectrogram from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";
import ClipAnnotationTags from "@/lib/components/clip_annotations/ClipAnnotationTags";
import Empty from "@/lib/components/Empty";
import Loading from "@/lib/components/Loading";
import useAnnotationTasks from "@/lib/hooks/annotation/useAnnotateTasks";
import useClipAnnotation from "@/app/hooks/api/useClipAnnotation";

import type { AnnotationTaskFilter } from "@/lib/api/annotation_tasks";
import type { TagFilter } from "@/lib/api/tags";
import type {
  AnnotationTask,
  ClipAnnotation,
  SoundEventAnnotation,
  SpectrogramParameters,
  Tag,
  User,
} from "@/lib/types";

export default function AnnotateTasks({
  taskFilter,
  tagFilter,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
  annotationTask,
  currentUser,
  instructions,
  onCreateTag,
  onCreateSoundEventAnnotation,
  onUpdateSoundEventAnnotation,
  onAddSoundEventTag,
  onRemoveSoundEventTag,
  onDeleteSoundEventAnnotation,
  onChangeTask,
  onAddClipTag,
  onRemoveClipTag,
  onParameterSave,
  onCompleteTask,
  onRejectTask,
  onVerifyTask,
}: {
  instructions: string;
  /** Filter to select which tasks are to be annotated */
  taskFilter?: AnnotationTaskFilter;
  /** Filter to select which tags are to be used for annotation */
  tagFilter?: TagFilter;
  /** Parameters to use for spectrogram rendering */
  parameters?: SpectrogramParameters;
  /** An optional annotation task to use initially */
  annotationTask?: AnnotationTask;
  /** The user who is annotating */
  currentUser: User;
  onCreateTag?: (tag: Tag) => void;
  onCreateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onUpdateSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onAddSoundEventTag?: (annotation: SoundEventAnnotation) => void;
  onRemoveSoundEventTag?: (annotation: SoundEventAnnotation) => void;
  onDeleteSoundEventAnnotation?: (annotation: SoundEventAnnotation) => void;
  onChangeTask?: (annotationTask: AnnotationTask) => void;
  onAddClipTag?: (annotation: ClipAnnotation) => void;
  onRemoveClipTag?: (annotation: ClipAnnotation) => void;
  onAddStatusBadge?: (task: AnnotationTask) => void;
  onRemoveStatusBadge?: (task: AnnotationTask) => void;
  onParameterSave?: (parameters: SpectrogramParameters) => void;
  onCompleteTask?: () => void;
  onRejectTask?: () => void;
  onVerifyTask?: () => void;
}) {
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(null);
  const [tagPalette, setTagPalette] = useState<Tag[]>([]);

  const tasks = useAnnotationTasks({
    filter: taskFilter,
    annotationTask: annotationTask,
    onChangeTask,
    onCompleteTask,
    onRejectTask,
    onVerifyTask,
  });

  const { data: clipAnnotation, isLoading: isLoadingClipAnnotation } =
    tasks.annotations;

  const { data, addTag, removeTag, addNote, removeNote } = useClipAnnotation({
    uuid: clipAnnotation?.uuid,
    clipAnnotation,
    onAddTag: onAddClipTag,
    onRemoveTag: onRemoveClipTag,
    enabled: clipAnnotation != null,
  });

  const onClearTags = useCallback(async () => {
    const tags = clipAnnotation?.tags?.slice(0);
    if (tags == null) return;
    for (const tag of tags) {
      await removeTag.mutateAsync(tag);
    }
  }, [clipAnnotation, removeTag]);

  const handleAddTagToPalette = useCallback((tag: Tag) => {
    setTagPalette((tags) => {
      if (tags.some((t) => t.key === tag.key && t.value === tag.value)) {
        return tags;
      }
      return [...tags, tag];
    });
  }, []);

  const handleRemoveTagFromPalette = useCallback((tag: Tag) => {
    setTagPalette((tags) => {
      return tags.filter((t) => t.key !== tag.key || t.value !== tag.value);
    });
  }, []);

  const handleClearTagPalette = useCallback(() => {
    setTagPalette([]);
  }, []);

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
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-row justify-between gap-8">
        <div className="grow">
          <AnnotationProgress
            current={tasks.current}
            instructions={instructions}
            tasks={tasks.tasks}
            filter={tasks._filter}
            onNext={tasks.nextTask}
            onPrevious={tasks.prevTask}
          />
        </div>
        <div className="w-[30rem] flex-none">
          {tasks.task != null && (
            <AnnotationTaskStatus
              task={tasks.task}
              onReview={tasks.markRejected.mutate}
              onDone={tasks.markCompleted.mutate}
              onVerify={tasks.markVerified.mutate}
              onRemoveBadge={tasks.removeBadge.mutate}
            />
          )}
        </div>
      </div>
      <div className="flex flex-row w-full gap-8">
        <div className="grow flex flex-col gap-2">
          {isLoadingClipAnnotation ? (
            <Loading />
          ) : data == null ? (
            <NoClipSelected />
          ) : (
            <>
              <RecordingAnnotationContext
                recording={data.clip.recording}
                onTagClick={handleAddTagToPalette}
              />
              <ClipAnnotationSpectrogram
                parameters={parameters}
                clipAnnotation={data}
                defaultTags={tagPalette}
                onParameterSave={onParameterSave}
                onSelectAnnotation={setSelectedAnnotation}
                tagFilter={tagFilter}
                onCreateTag={onCreateTag}
                onAddSoundEventTag={onAddSoundEventTag}
                onRemoveSoundEventTag={onRemoveSoundEventTag}
                onCreateSoundEventAnnotation={onCreateSoundEventAnnotation}
                onUpdateSoundEventAnnotation={onUpdateSoundEventAnnotation}
                onDeleteSoundEventAnnotation={onDeleteSoundEventAnnotation}
              />
              {selectedAnnotation == null ? (
                <Empty>
                  No sound event selected. Select a sound event to view details.
                </Empty>
              ) : (
                <SelectedSoundEventAnnotation
                  clipAnnotation={data}
                  tagFilter={tagFilter}
                  soundEventAnnotation={selectedAnnotation}
                  onAddTag={onAddSoundEventTag}
                  onCreateTag={onCreateTag}
                  onRemoveTag={onRemoveSoundEventTag}
                />
              )}
            </>
          )}
        </div>
        <div className="w-[30rem] flex-none flex flex-col gap-4">
          <AnnotationTagPalette
            tags={tagPalette}
            tagFilter={tagFilter}
            onClick={addTag.mutate}
            onCreateTag={onCreateTag}
            onAddTag={handleAddTagToPalette}
            onRemoveTag={handleRemoveTagFromPalette}
            onClearTags={handleClearTagPalette}
          />
          <ClipAnnotationTags
            tagFilter={tagFilter}
            clipAnnotation={data}
            onAddTag={addTag.mutate}
            onRemoveTag={removeTag.mutate}
            onClearTags={onClearTags}
            onCreateTag={onCreateTag}
          />
          <ClipAnnotationNotes
            onCreateNote={addNote.mutate}
            onDeleteNote={removeNote.mutate}
            clipAnnotation={data}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}

function NoClipSelected() {
  return <Empty>No clip selected</Empty>;
}
