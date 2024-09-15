import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import Loading from "@/lib/components/ui/Loading";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import { H2, H3 } from "@/lib/components/ui/Headings";
import { FilterIcon, TasksIcon } from "@/lib/components/icons";
import { Input, InputGroup } from "@/lib/components/inputs/index";
import Toggle from "@/lib/components/inputs/Toggle";
import type { RecordingFilter } from "@/lib/api/recordings";

import type { Dataset } from "@/lib/types";

export default function AnnotationProjectTasks(props: {
  dataset?: Dataset;
  isLoading: boolean;
  numSelectedRecordings?: number;
  numSelectedClips?: number;
  recordingFilter: RecordingFilter;
  fixedFilterFields: (keyof RecordingFilter)[];
  subsampleRecordings?: boolean;
  maxRecordings?: number;
  shouldClip?: boolean;
  clipLength?: number;
  clipOverlap?: number;
  subsampleClip?: boolean;
  maxClipsPerRecording?: number;
  onSetFilterField?: <T extends keyof RecordingFilter>(
    field: T,
    value: RecordingFilter[T],
  ) => void;
  onToggleSubsample?: (subsample: boolean) => void;
  onSetMaxRecordings?: (maxRecordings: number) => void;
  onAddTasks?: () => void;
  onToggleClip?: (clip: boolean) => void;
  onSetClipLength?: (clipLength: number) => void;
  onSetClipOverlap?: (clipOverlap: number) => void;
  onSetClipSubsample?: (subsample: boolean) => void;
  onSetMaxClips?: (maxClips: number) => void;
  DatasetSearch: JSX.Element;
}) {
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
          <SelectDataset DatasetSearch={props.DatasetSearch} />
          {props.dataset != null && (
            <>
              <SelectRecordings
                subsample={props.subsampleRecordings}
                maxRecordings={props.maxRecordings}
                filter={props.recordingFilter}
                fixedFilterFields={props.fixedFilterFields}
                onSetFilterField={props.onSetFilterField}
                onSetMaxRecordings={props.onSetMaxRecordings}
                onToggleSubsample={props.onToggleSubsample}
              />
              <ExtractClips
                shouldClip={props.shouldClip}
                clipLength={props.clipLength}
                clipOverlap={props.clipOverlap}
                subsampleClip={props.subsampleClip}
                maxClipsPerRecording={props.maxClipsPerRecording}
                onToggleClip={props.onToggleClip}
                onSetClipLength={props.onSetClipLength}
                onSetClipOverlap={props.onSetClipOverlap}
                onSetClipSubsample={props.onSetClipSubsample}
                onSetMaxClips={props.onSetMaxClips}
              />
            </>
          )}
        </div>
        <div className="w-96">
          <div className="sticky top-8">
            <ReviewClips
              isLoading={props.isLoading}
              dataset={props.dataset}
              numClips={props.numSelectedClips}
              numRecordings={props.numSelectedRecordings}
              onAdd={props.onAddTasks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectDataset({ DatasetSearch }: { DatasetSearch: JSX.Element }) {
  return (
    <Card>
      <div>
        <H3 className="text-lg">Select Dataset</H3>
        <p className="text-stone-500">
          Choose a dataset from which to source recordings.
        </p>
      </div>
      {DatasetSearch}
    </Card>
  );
}

function SelectRecordings({
  subsample = false,
  maxRecordings,
  filter,
  fixedFilterFields,
  onSetFilterField,
  onToggleSubsample,
  onSetMaxRecordings,
}: {
  subsample?: boolean;
  maxRecordings?: number;
  filter?: RecordingFilter;
  fixedFilterFields?: (keyof RecordingFilter)[];
  onSetFilterField?: <T extends keyof RecordingFilter>(
    field: T,
    value: RecordingFilter[T],
  ) => void;
  onToggleSubsample?: (subsample: boolean) => void;
  onSetMaxRecordings?: (maxRecordings: number) => void;
}) {
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
                filter={filter}
                fixedFilterFields={fixedFilterFields}
                filterDef={recordingFilterDefs}
              />
            </div>
            <FilterMenu
              onSetFilterField={onSetFilterField}
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
            <Toggle isSelected={subsample} onChange={onToggleSubsample} />
            <Input
              className="grow"
              type="number"
              placeholder="Maximum number of recordings"
              value={subsample ? maxRecordings : undefined}
              onChange={(event) =>
                onSetMaxRecordings?.(parseInt(event.target.value))
              }
              required={subsample}
              disabled={!subsample}
            />
          </div>
        </InputGroup>
      </div>
    </Card>
  );
}

function ExtractClips({
  shouldClip = true,
  clipLength = 3,
  clipOverlap = 0,
  subsampleClip = false,
  maxClipsPerRecording = 3,
  onToggleClip,
  onSetClipLength,
  onSetClipOverlap,
  onSetClipSubsample,
  onSetMaxClips,
}: {
  shouldClip?: boolean;
  clipLength?: number;
  clipOverlap?: number;
  subsampleClip?: boolean;
  maxClipsPerRecording?: number;
  onToggleClip?: (clip: boolean) => void;
  onSetClipLength?: (clipLength: number) => void;
  onSetClipOverlap?: (clipOverlap: number) => void;
  onSetClipSubsample?: (subsample: boolean) => void;
  onSetMaxClips?: (maxClips: number) => void;
}) {
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
        <Toggle isSelected={shouldClip} onChange={onToggleClip} />
      </InputGroup>
      {shouldClip && (
        <>
          <InputGroup
            name="clipLength"
            label="Clip Length"
            help="Specify the duration of each clip in seconds."
          >
            <Input
              type="number"
              value={clipLength}
              onChange={(e) => onSetClipLength?.(e.target.valueAsNumber)}
              required
              step={0.1}
            />
          </InputGroup>
          <InputGroup
            name="overlap"
            label="Overlap"
            help="Define the overlap duration between clips in seconds."
          >
            <Input
              type="number"
              value={clipOverlap}
              onChange={(e) => onSetClipOverlap?.(e.target.valueAsNumber)}
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
                isSelected={subsampleClip}
                onChange={onSetClipSubsample}
              />
              <Input
                className="grow"
                type="number"
                placeholder="Maximum clips per recording"
                value={subsampleClip ? maxClipsPerRecording : undefined}
                onChange={(e) => onSetMaxClips?.(e.target.valueAsNumber)}
                required={subsampleClip}
                disabled={!subsampleClip}
              />
            </div>
          </InputGroup>
        </>
      )}
    </Card>
  );
}

function ReviewClips({
  isLoading = false,
  numClips = 0,
  numRecordings = 0,
  dataset,
  onAdd,
}: {
  isLoading?: boolean;
  dataset?: Dataset;
  numClips?: number;
  numRecordings?: number;
  onAdd?: () => void;
}) {
  return (
    <Card>
      <H3>Summary</H3>
      {dataset == null ? (
        <p className="text-stone-500">Select a dataset to continue.</p>
      ) : isLoading ? (
        <Loading />
      ) : (
        <>
          <ul className="list-disc list-inside">
            <li>
              Selected dataset:{" "}
              <span className="text-emerald-500">{dataset.name}</span>
            </li>
            <li>
              Selected recordings:{" "}
              <span className="text-emerald-500">{numRecordings}</span>
            </li>
            <li>
              Tasks to add:{" "}
              <span className="font-bold text-emerald-500">{numClips}</span>
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
