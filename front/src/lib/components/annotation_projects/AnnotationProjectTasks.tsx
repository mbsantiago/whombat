import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import recordingFilterDefs from "@/lib/components/filters/recordings";
import * as icons from "@/lib/components/icons";
import * as inputs from "@/lib/components/inputs";
import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

export default function AnnotationProjectTasks(props: {
  dataset?: types.Dataset;
  isLoading: boolean;
  numSelectedRecordings?: number;
  numSelectedClips?: number;
  recordingFilter: types.RecordingFilter;
  fixedFilterFields: (keyof types.RecordingFilter)[];
  subsampleRecordings?: boolean;
  maxRecordings?: number;
  shouldClip?: boolean;
  clipLength?: number;
  clipOverlap?: number;
  subsampleClip?: boolean;
  maxClipsPerRecording?: number;
  onSetFilterField?: <T extends keyof types.RecordingFilter>(
    field: T,
    value: types.RecordingFilter[T],
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
      <ui.H2>
        <icons.TasksIcon className="inline-block mr-2 w-5 h-5 align-middle" />
        Add Tasks
      </ui.H2>
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
    <ui.Card>
      <div>
        <ui.H3 className="text-lg">Select Dataset</ui.H3>
        <p className="text-stone-500">
          Choose a dataset from which to source recordings.
        </p>
      </div>
      {DatasetSearch}
    </ui.Card>
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
  filter?: types.RecordingFilter;
  fixedFilterFields?: (keyof types.RecordingFilter)[];
  onSetFilterField?: <T extends keyof types.RecordingFilter>(
    field: T,
    value: types.RecordingFilter[T],
  ) => void;
  onToggleSubsample?: (subsample: boolean) => void;
  onSetMaxRecordings?: (maxRecordings: number) => void;
}) {
  return (
    <ui.Card>
      <div>
        <ui.H3 className="text-lg">Select Recordings</ui.H3>
        <p className="text-stone-500">
          Pick recordings to extract clips for your annotation project.
          Optionally, filter and choose a subset for clip extraction.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <inputs.Group
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
                  <icons.FilterIcon className="inline-block w-4 h-4 stroke-2" />
                </>
              }
            />
          </div>
        </inputs.Group>
        <inputs.Group
          name="subsample"
          label="Subsample recordings"
          help="Set a maximum for clip extraction. A random subset will be selected; all if not specified."
        >
          <div className="inline-flex gap-3 items-center w-full">
            <inputs.Toggle
              isSelected={subsample}
              onChange={onToggleSubsample}
            />
            <inputs.Input
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
        </inputs.Group>
      </div>
    </ui.Card>
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
    <ui.Card>
      <div>
        <ui.H3>Clip Extraction</ui.H3>
        <p className="text-stone-500">
          Customize how to extract clips from the selected recordings.
        </p>
      </div>
      <inputs.Group
        name="clip"
        label="Should Clip"
        help="Enable to extract smaller clips from the recordings; disable to use the entire recording as a clip."
      >
        <inputs.Toggle isSelected={shouldClip} onChange={onToggleClip} />
      </inputs.Group>
      {shouldClip && (
        <>
          <inputs.Group
            name="clipLength"
            label="Clip Length"
            help="Specify the duration of each clip in seconds."
          >
            <inputs.Input
              type="number"
              value={clipLength}
              onChange={(e) => onSetClipLength?.(e.target.valueAsNumber)}
              required
              step={0.1}
            />
          </inputs.Group>
          <inputs.Group
            name="overlap"
            label="Overlap"
            help="Define the overlap duration between clips in seconds."
          >
            <inputs.Input
              type="number"
              value={clipOverlap}
              onChange={(e) => onSetClipOverlap?.(e.target.valueAsNumber)}
              required
            />
          </inputs.Group>
          <inputs.Group
            name="subsample"
            label="Subsample clips"
            help="Set a maximum number of clips to extract from each recording. A random subset will be selected. Leave empty to use all clips."
          >
            <div className="inline-flex gap-3 items-center w-full">
              <inputs.Toggle
                isSelected={subsampleClip}
                onChange={onSetClipSubsample}
              />
              <inputs.Input
                className="grow"
                type="number"
                placeholder="Maximum clips per recording"
                value={subsampleClip ? maxClipsPerRecording : undefined}
                onChange={(e) => onSetMaxClips?.(e.target.valueAsNumber)}
                required={subsampleClip}
                disabled={!subsampleClip}
              />
            </div>
          </inputs.Group>
        </>
      )}
    </ui.Card>
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
  dataset?: types.Dataset;
  numClips?: number;
  numRecordings?: number;
  onAdd?: () => void;
}) {
  return (
    <ui.Card>
      <ui.H3>Summary</ui.H3>
      {dataset == null ? (
        <p className="text-stone-500">Select a dataset to continue.</p>
      ) : isLoading ? (
        <ui.Loading />
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
          <ui.Button onClick={onAdd}>Add Clips</ui.Button>
        </>
      )}
    </ui.Card>
  );
}
