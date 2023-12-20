import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import useDatasets from "@/hooks/api/useDatasets";
import useRecordings from "@/hooks/api/useRecordings";
import useAnnotationProject from "@/hooks/api/useAnnotationProject";
import SearchMenu from "@/components/SearchMenu";
import { type AnnotationProject } from "@/api/schemas";
import { type Recording } from "@/api/schemas";
import { type Dataset } from "@/api/schemas";
import { type ClipCreate } from "@/api/clips";
import { Input, InputGroup } from "@/components/inputs";
import { FilterIcon } from "@/components/icons";
import FilterMenu from "@/components/FilterMenu";
import FilterBar from "@/components/FilterBar";
import Card from "@/components/Card";
import Toggle from "@/components/Toggle";
import Button from "@/components/Button";
import recordingFilterDefs from "@/components/filters/recordings";

type RecordingSelection = {
  dataset?: Dataset;
  subsample: boolean;
  maxRecordings: number;
};

type ClipExtraction = {
  clip: boolean;
  clipLength: number;
  overlap: number;
  subsample: boolean;
  maxClipsPerRecording: number;
};

function getRandomSubarray<T>(arr: T[], size: number) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function computeClips({
  recordings,
  config,
}: {
  recordings: Recording[];
  config: ClipExtraction;
}): ClipCreate[] {
  let clips: ClipCreate[] = [];
  let {
    clipLength,
    clip: shouldClip,
    subsample,
    overlap,
    maxClipsPerRecording: maxClips,
  } = config;

  for (let recording of recordings) {
    if (!shouldClip) {
      // Add whole recording as a clip
      clips.push({
        recording_id: recording.id,
        start_time: 0,
        end_time: recording.duration,
      });
      continue;
    }

    // Compute all recording clips of the given length
    let recordingClips: ClipCreate[] = [];

    // Compute total number of clips
    let totalClips = Math.ceil(recording.duration / (clipLength - overlap));
    for (let i = 0; i < totalClips; i++) {
      // Compute start and end time
      let start_time = i * (clipLength - overlap);
      let end_time = start_time + clipLength;
      recordingClips.push({
        recording_id: recording.id,
        start_time,
        end_time,
      });
    }

    if (!subsample) {
      // Add all clips
      clips.push(...recordingClips);
      continue;
    }

    // Subsample clips
    let subsampledClips: ClipCreate[] = getRandomSubarray(
      recordingClips,
      maxClips,
    );
    clips.push(...subsampledClips);
  }

  return clips;
}

function SelectRecordings({
  onSelection,
}: {
  onSelection: (recordings: Recording[]) => void;
}) {
  const [selection, setSelection] = useState<RecordingSelection>({
    subsample: false,
    maxRecordings: 5000,
  });

  const datasets = useDatasets({
    pageSize: 1000,
  });

  const filter = useMemo(
    () => ({ dataset: selection?.dataset?.id ?? -1 }),
    [selection?.dataset?.id],
  );
  const recordings = useRecordings({ pageSize: 10000, filter });

  useEffect(() => {
    if (selection?.dataset != null) {
      if (selection.subsample) {
        onSelection([
          ...getRandomSubarray(recordings.items, selection.maxRecordings),
        ]);
      } else {
        onSelection([...recordings.items]);
      }
    }
  }, [selection, recordings.items, onSelection]);

  return (
    <Card>
      <div>
        <h2 className="text-lg">Select Recordings</h2>
        <p className="text-stone-500">
          Choose the recordings from which to extract clips to add to the
          annotation project.
        </p>
      </div>
      <div className="relative">
        <InputGroup
          name="dataset"
          label="Choose a dataset"
          help="Select a dataset from which to source recordings."
        >
          <SearchMenu
            value={selection?.dataset}
            options={datasets.items ?? []}
            onSelect={(dataset: Dataset) => {
              setSelection((selection: RecordingSelection) => ({
                ...selection,
                dataset,
              }));
              recordings.filter.set("dataset", dataset.id, true);
            }}
            displayValue={(dataset: Dataset) => dataset.name}
            getOptionKey={(dataset: Dataset) => dataset.id}
            fields={["name"]}
            renderOption={(dataset: Dataset) => dataset.name}
            limit={6}
            static={false}
          />
        </InputGroup>
      </div>
      <div>
        <InputGroup
          name="recording-filter"
          label="Filter recordings"
          help="Optionally, select a subset of recordings to extract clips from by applying some filters."
        >
          <div className="flex flex-row items-center gap-2">
            <div className="grow">
              <FilterBar showIfEmpty filter={recordings.filter} />
            </div>
            <FilterMenu
              filter={recordings.filter}
              filterDefs={recordingFilterDefs}
              button={
                <span className="text-emerald-900">
                  Add filters{" "}
                  <FilterIcon className="inline-block h-4 w-4 stroke-2" />
                </span>
              }
            />
          </div>
        </InputGroup>
      </div>
      <div>
        <InputGroup
          name="subsample"
          label="Subsample recordings"
          help="Set a maximum number of recordings to extract clips from. A random subset of recordings will be selected. If not set, all recordings will be used."
        >
          <div className="inline-flex items-center w-full gap-3">
            <Toggle
              checked={selection.subsample}
              onChange={(subsample) =>
                setSelection((selection: RecordingSelection) => ({
                  ...selection,
                  subsample,
                }))
              }
            />
            <Input
              className="grow"
              type="number"
              placeholder="Maximum number of recordings"
              value={selection.subsample ? selection.maxRecordings : undefined}
              onChange={(e) =>
                setSelection((selection: RecordingSelection) => ({
                  ...selection,
                  maxRecordings: e.target.valueAsNumber,
                }))
              }
              required={selection.subsample}
              disabled={!selection.subsample}
            />
          </div>
        </InputGroup>
      </div>
    </Card>
  );
}

// type ClipExtraction = {
//   clip: boolean;
//   clipLength: number;
//   overlap: number;
//   subsample: boolean;
//   maxClipsPerRecording: number;
// };

function ExtractClips({
  onExtraction,
  selectedRecordings,
}: {
  selectedRecordings: Recording[];
  onExtraction: (clips: ClipCreate[]) => void;
}) {
  const [extraction, setExtraction] = useState<ClipExtraction>({
    clipLength: 10,
    subsample: false,
    maxClipsPerRecording: 10,
    clip: true,
    overlap: 0,
  });

  useEffect(() => {
    onExtraction(
      computeClips({ recordings: selectedRecordings, config: extraction }),
    );
  }, [onExtraction, selectedRecordings, extraction]);

  return (
    <Card>
      <div>
        <h2 className="text-lg">Clip Extraction</h2>
        <p className="text-stone-500">
          Choose how to extract clips from the selected recordings.
        </p>
      </div>
      <InputGroup
        name="clip"
        label="Should Clip"
        help="If checked, smaller clips will be extracted from the recordings. If unchecked, the whole recording will be added as a clip."
      >
        <Toggle
          checked={extraction.clip}
          onChange={(clip) =>
            setExtraction((extraction: ClipExtraction) => ({
              ...extraction,
              clip,
            }))
          }
        />
      </InputGroup>
      {extraction.clip && (
        <>
          <InputGroup
            name="clipLength"
            label="Clip Length"
            help="The length of each clip in seconds."
          >
            <Input
              type="number"
              value={extraction.clipLength}
              onChange={(e) =>
                setExtraction((extraction: ClipExtraction) => ({
                  ...extraction,
                  clipLength: e.target.valueAsNumber,
                }))
              }
              required
            />
          </InputGroup>
          <InputGroup
            name="overlap"
            label="Overlap"
            help="The amount of overlap between clips in seconds."
          >
            <Input
              type="number"
              value={extraction.overlap}
              onChange={(e) =>
                setExtraction((extraction: ClipExtraction) => ({
                  ...extraction,
                  overlap: e.target.valueAsNumber,
                }))
              }
              required
            />
          </InputGroup>
          <InputGroup
            name="subsample"
            label="Subsample clips"
            help="Set a maximum number of clips to extract from each recording. A random subset of clips will be selected. If not set, all clips will be used."
          >
            <div className="inline-flex items-center w-full gap-3">
              <Toggle
                checked={extraction.subsample}
                onChange={(subsample) =>
                  setExtraction((extraction: ClipExtraction) => ({
                    ...extraction,
                    subsample,
                  }))
                }
              />
              <Input
                className="grow"
                type="number"
                placeholder="-"
                value={
                  extraction.subsample
                    ? extraction.maxClipsPerRecording
                    : undefined
                }
                onChange={(e) =>
                  setExtraction((extraction: ClipExtraction) => ({
                    ...extraction,
                    maxClipsPerRecording: e.target.valueAsNumber,
                  }))
                }
                required={extraction.subsample}
                disabled={!extraction.subsample}
              />
            </div>
          </InputGroup>
        </>
      )}
    </Card>
  );
}

function ReviewClips({
  clips,
  recordings,
  onAdd,
}: {
  clips: ClipCreate[];
  recordings: Recording[];
  onAdd?: () => void;
}) {
  return (
    <Card>
      <h2 className="text-lg">Summary</h2>
      <ul className="list-disc list-inside">
        <li>
          <span className="text-blue-500 font-bold">{clips.length}</span> clips
        </li>
        <li>
          from{" "}
          <span className="text-blue-500 font-bold">{recordings.length}</span>{" "}
          recordings
        </li>
      </ul>
      <p className="text-stone-500">
        When ready click on the button below to add clips to the annotation
        project.
      </p>
      <Button onClick={onAdd}>Add Clips</Button>
    </Card>
  );
}

export default function ProjectClips({
  project: data,
}: {
  project: AnnotationProject;
}) {
  const project = useAnnotationProject({
    annotation_project_id: data.id,
  });

  const [selectedRecordings, setSelectedRecordings] = useState<Recording[]>([]);
  const [selectedClips, setSelectedClips] = useState<ClipCreate[]>([]);

  const onAdd = () => {
    toast.promise(
      project.addAnnotationTasks.mutateAsync(selectedClips, {
        onSuccess: () => {
          setSelectedClips([]);
          setSelectedRecordings([]);
        },
      }),
      {
        loading: "Adding clips to project...",
        success:
          "Clips added to project 🎉! Add more clips or go to the project page to start annotating. ",
        error: "Failed to add clips to project.",
      },
    );
  };

  return (
    <div className="flex flex-row gap-8">
      <div className="flex flex-col gap-y-6">
        <SelectRecordings onSelection={setSelectedRecordings} />
        <ExtractClips
          onExtraction={setSelectedClips}
          selectedRecordings={selectedRecordings}
        />
      </div>
      <div className="basis-96">
        <div className="sticky top-8">
          <ReviewClips
            clips={selectedClips}
            recordings={selectedRecordings}
            onAdd={onAdd}
          />
        </div>
      </div>
    </div>
  );
}
