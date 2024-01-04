import { useEffect, useMemo, useState } from "react";

import { type ClipCreateMany } from "@/api/clips";
import Button from "@/components/Button";
import Card from "@/components/Card";
import DatasetSearch from "@/components/datasets/DatasetSearch";
import FilterBar from "@/components/filters/FilterBar";
import FilterMenu from "@/components/filters/FilterMenu";
import recordingFilterDefs from "@/components/filters/recordings";
import { H2, H3 } from "@/components/Headings";
import { FilterIcon, TasksIcon } from "@/components/icons";
import { Input, InputGroup } from "@/components/inputs/index";
import Toggle from "@/components/inputs/Toggle";
import useAnnotationProject from "@/hooks/api/useAnnotationProject";
import useRecordings from "@/hooks/api/useRecordings";
import { getRandomSubarray } from "@/utils/arrays";
import { type ClipExtraction, computeClips } from "@/utils/clips";

import type {
  AnnotationProject,
  AnnotationTask,
  Dataset,
  Recording,
} from "@/types";

export default function AnnotationProjectTasks({
  annotationProject: initialData,
  onAddTasks,
}: {
  annotationProject: AnnotationProject;
  onAddTasks?: (tasks: AnnotationTask[]) => void;
}) {
  const project = useAnnotationProject({
    uuid: initialData.uuid,
    annotationProject: initialData,
    onAddAnnotationTasks: onAddTasks,
  });

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [selectedRecordings, setSelectedRecordings] = useState<Recording[]>([]);
  const [selectedClips, setSelectedClips] = useState<ClipCreateMany>([]);

  return (
    <div className="flex flex-col gap-8">
      <H2>
        <TasksIcon className="inline-block mr-2 w-5 h-5 align-middle" />
        Add Tasks
      </H2>
      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-y-6 max-w-prose">
          <p className="max-w-prose text-stone-500">
            On this page, you can add tasks to your annotation project. Choose a
            dataset to pull recordings from, apply filters to narrow down your
            selection, and configure how audio clips are extracted from the
            chosen recordings.
          </p>
          <SelectDataset selected={dataset} onSelect={setDataset} />
          {dataset != null && (
            <>
              <SelectRecordings
                dataset={dataset}
                onSelection={setSelectedRecordings}
              />
              <ExtractClips
                onExtraction={setSelectedClips}
                selectedRecordings={selectedRecordings}
              />
            </>
          )}
        </div>
        <div className="w-96">
          <div className="sticky top-8">
            <ReviewClips
              dataset={dataset}
              clips={selectedClips}
              recordings={selectedRecordings}
              onAdd={() => project.addAnnotationTasks.mutate(selectedClips)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectDataset({
  selected,
  onSelect,
}: {
  selected: Dataset | null;
  onSelect: (dataset: Dataset) => void;
}) {
  return (
    <Card>
      <div>
        <H3 className="text-lg">Select Dataset</H3>
        <p className="text-stone-500">
          Choose a dataset from which to source recordings.
        </p>
      </div>
      <DatasetSearch selected={selected} onSelect={onSelect} />
    </Card>
  );
}

type RecordingSelection = {
  subsample: boolean;
  maxRecordings: number;
};

function SelectRecordings({
  dataset,
  onSelection,
}: {
  dataset: Dataset;
  onSelection: (recordings: Recording[]) => void;
}) {
  const [selection, setSelection] = useState<RecordingSelection>({
    subsample: false,
    maxRecordings: 5000,
  });

  const filter = useMemo(() => ({ dataset: dataset }), [dataset]);

  const recordings = useRecordings({
    pageSize: 10000,
    filter,
    fixed: ["dataset"],
  });

  useEffect(() => {
    if (selection.subsample) {
      onSelection([
        ...getRandomSubarray(recordings.items, selection.maxRecordings),
      ]);
    } else {
      onSelection([...recordings.items]);
    }
  }, [dataset, selection, recordings.items, onSelection]);

  return (
    <Card>
      <div>
        <H3 className="text-lg">Select Recordings</H3>
        <p className="text-stone-500">
          Pick recordings to extract clips for your annotation project.
          Optionally, filter and choose a subset for clip extraction.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <InputGroup
          name="recording-filter"
          label="Filter recordings"
          help="Select a subset for clip extraction by applying filters."
        >
          <div className="flex flex-row gap-2 items-center">
            <div className="grow">
              <FilterBar
                showIfEmpty
                filter={recordings.filter}
                filterDef={recordingFilterDefs}
              />
            </div>
            <FilterMenu
              filter={recordings.filter}
              filterDef={recordingFilterDefs}
              mode="text"
              button={
                <>
                  Add filters{" "}
                  <FilterIcon className="inline-block w-4 h-4 stroke-2" />
                </>
              }
            />
          </div>
        </InputGroup>
        <InputGroup
          name="subsample"
          label="Subsample recordings"
          help="Set a maximum for clip extraction. A random subset will be selected; all if not specified."
        >
          <div className="inline-flex gap-3 items-center w-full">
            <Toggle
              isSelected={selection.subsample}
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

function ExtractClips({
  onExtraction,
  selectedRecordings,
}: {
  selectedRecordings: Recording[];
  onExtraction: (clips: ClipCreateMany) => void;
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
        <H3>Clip Extraction</H3>
        <p className="text-stone-500">
          Customize how to extract clips from the selected recordings.
        </p>
      </div>
      <InputGroup
        name="clip"
        label="Should Clip"
        help="Enable to extract smaller clips from the recordings; disable to use the entire recording as a clip."
      >
        <Toggle
          isSelected={extraction.clip}
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
            help="Specify the duration of each clip in seconds."
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
            help="Define the overlap duration between clips in seconds."
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
            help="Set a maximum number of clips to extract from each recording. A random subset will be selected. Leave empty to use all clips."
          >
            <div className="inline-flex gap-3 items-center w-full">
              <Toggle
                isSelected={extraction.subsample}
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
                placeholder="Maximum clips per recording"
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
  dataset,
  recordings,
  onAdd,
}: {
  dataset: Dataset | null;
  clips: ClipCreateMany;
  recordings: Recording[];
  onAdd?: () => void;
}) {
  return (
    <Card>
      <H3>Summary</H3>
      {dataset == null ? (
        <p className="text-stone-500">Select a dataset to continue.</p>
      ) : (
        <>
          <ul className="list-disc list-inside">
            <li>
              Selected dataset:{" "}
              <span className="text-emerald-500">{dataset.name}</span>
            </li>
            <li>
              Selected recordings:{" "}
              <span className="text-emerald-500">{recordings.length}</span>
            </li>
            <li>
              Tasks to add:{" "}
              <span className="font-bold text-emerald-500">{clips.length}</span>
            </li>
          </ul>
          <p className="text-stone-500">
            Once satisfied with your selections, click the button below to add
            the chosen clips to the annotation project.
          </p>
          <Button onClick={onAdd}>Add Clips</Button>
        </>
      )}
    </Card>
  );
}
