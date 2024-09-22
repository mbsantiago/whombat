import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import DatasetSearch from "@/app/components/datasets/DatasetSearch";

import useAnnotationProject from "@/app/hooks/api/useAnnotationProject";

import api from "@/app/api";

import AnnotationProjectTasksBase from "@/lib/components/annotation_projects/AnnotationProjectTasks";

import useFilter from "@/lib/hooks/utils/useFilter";

import type {
  AnnotationProject,
  AnnotationTask,
  Dataset,
  RecordingFilter,
} from "@/lib/types";
import { computeClips } from "@/lib/utils/clips";

export default function AnnotationProjectTasks({
  annotationProject: initialData,
  onAddTasks,
}: {
  annotationProject: AnnotationProject;
  onAddTasks?: (tasks: AnnotationTask[]) => void;
}) {
  const { addAnnotationTasks } = useAnnotationProject({
    uuid: initialData.uuid,
    annotationProject: initialData,
    onAddAnnotationTasks: onAddTasks,
  });

  const filter = useFilter<RecordingFilter>();

  const dataset = filter.get("dataset") as Dataset | undefined;

  const { data: recordings, isLoading } = useQuery({
    queryKey: ["recordings", JSON.stringify(filter.filter)],
    queryFn: () => api.recordings.getMany({ ...filter.filter, limit: -1 }),
    enabled: !!dataset,
  });

  const [state, setState] = useState<{
    subsampleRecordings: boolean;
    maxRecordings: number;
    shouldClip: boolean;
    clipLength: number;
    subsampleClips: boolean;
    maxClipsPerRecording: number;
    overlapOverlap: number;
  }>({
    subsampleRecordings: false,
    maxRecordings: 5000,
    shouldClip: true,
    clipLength: 10,
    subsampleClips: false,
    maxClipsPerRecording: 10,
    overlapOverlap: 0,
  });

  const clips = useMemo(
    () =>
      computeClips({
        recordings: recordings?.items || [],
        config: {
          subsampleRecordings: state.subsampleRecordings,
          maxRecordings: state.maxRecordings,
          clip: state.shouldClip,
          clipLength: state.clipLength,
          clipOverlap: state.overlapOverlap,
          subsampleClips: state.subsampleClips,
          maxClipsPerRecording: state.maxClipsPerRecording,
        },
      }),
    [state, recordings?.items],
  );

  return (
    <AnnotationProjectTasksBase
      dataset={dataset}
      isLoading={isLoading}
      numSelectedRecordings={recordings?.total}
      numSelectedClips={clips.length}
      recordingFilter={filter.filter}
      fixedFilterFields={["dataset"]}
      subsampleRecordings={state.subsampleRecordings}
      maxRecordings={state.maxRecordings}
      shouldClip={state.shouldClip}
      clipLength={state.clipLength}
      clipOverlap={state.overlapOverlap}
      subsampleClip={state.subsampleClips}
      maxClipsPerRecording={state.maxClipsPerRecording}
      DatasetSearch={
        <DatasetSearch
          selected={dataset}
          onSelect={(dataset) => filter.set("dataset", dataset)}
        />
      }
      onSetFilterField={filter.set}
      onToggleSubsample={(subsample) =>
        setState((prev) => ({ ...prev, subsampleRecordings: subsample }))
      }
      onSetMaxRecordings={(maxRecordings) =>
        setState((prev) => ({ ...prev, maxRecordings }))
      }
      onToggleClip={(shouldClip) =>
        setState((prev) => ({ ...prev, shouldClip }))
      }
      onSetClipLength={(clipLength) =>
        setState((prev) => ({ ...prev, clipLength }))
      }
      onSetClipOverlap={(overlapOverlap) =>
        setState((prev) => ({ ...prev, overlapOverlap }))
      }
      onSetClipSubsample={(subsampleClips) =>
        setState((prev) => ({ ...prev, subsampleClips }))
      }
      onSetMaxClips={(maxClipsPerRecording) =>
        setState((prev) => ({ ...prev, maxClipsPerRecording }))
      }
      onAddTasks={() => addAnnotationTasks.mutate(clips)}
    />
  );
}
