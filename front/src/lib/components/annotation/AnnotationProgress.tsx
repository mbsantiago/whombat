import { FC, FormEvent, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

import ShortcutHelper from "@/lib/components/ShortcutHelper";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterButton from "@/lib/components/filters/FilterButton";
import taskFilterDefs from "@/lib/components/filters/tasks";
import { NextIcon, PreviousIcon } from "@/lib/components/icons";
import Button from "@/lib/components/ui/Button";
import Dialog from "@/lib/components/ui/Dialog";
import KeyboardKey from "@/lib/components/ui/KeyboardKey";
import ProgressBar from "@/lib/components/ui/ProgressBar";
import Tooltip from "@/lib/components/ui/Tooltip";

import type {
  AnnotationTask,
  AnnotationTaskFilter,
  Shortcut,
} from "@/lib/types";
import { computeAnnotationTasksProgress } from "@/lib/utils/annotation_tasks";

import AnnotationTaskBulletList from "../annotation_tasks/AnnotationTaskBulletList";
import Search from "../inputs/Search";

const SHORTCUTS: Shortcut[] = [
  {
    label: "Previous Task",
    shortcut: "p",
    description:
      "Go to the previous task. The state of the current task will be preserved.",
  },
  {
    label: "Next Task",
    shortcut: "n",
    description:
      "Go to the next task. The state of the current task will be preserved.",
  },
  {
    label: "Select Annotation",
    shortcut: "s",
    description:
      "Toggle the selection tool for annotations. When toggled, clicking on an annotation will select it.",
  },
  {
    label: "Add Annotation",
    shortcut: "a",
    description:
      "Toggle the creation of new annotations. When toggled, clicking on the spectrogram will create a new annotation.",
  },
  {
    label: "Delete Annotation",
    shortcut: "d",
    description:
      "Toggle the deletion tool. When toggled, clicking on an annotation will delete it.",
  },
  {
    label: "Zoom",
    shortcut: "z",
    description:
      "Toggle the zoom tool. When toggled, draw a rectangle to zoom in on a region of the spectrogram.",
  },
  {
    label: "Toggle Play",
    shortcut: "space",
    description: "Toggle the play/pause of the audio",
  },
];

function SearchTask({
  onSubmit,
}: {
  onSubmit: (value: string | FormEvent<HTMLInputElement>) => void;
}) {
  return (
    <Dialog
      mode="text"
      variant="info"
      title="Search Task"
      label="Search"
      width="max-w-prose"
    >
      {() => (
        <div className="flex flex-col gap-2 w-full">
          <div className="space-y-1">
            <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400">
              Search for a task by its UUID. Paste the UUID in the search bar
              and press enter to navigate to the task.
            </p>
          </div>
          <Search placeholder="Task UUID" onSubmit={onSubmit} />
        </div>
      )}
    </Dialog>
  );
}

function CurrentTask({ currentTask }: { currentTask?: AnnotationTask }) {
  return (
    <div className="inline-flex gap-1 items-center">
      <Tooltip
        tooltip={
          <div className="flex flex-col gap-2 p-1 min-w-[200px]">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-400 dark:text-stone-500">
                Task ID
              </span>
            </div>
            <div className="relative group">
              <code className="block p-2 font-mono leading-relaxed text-blue-500 break-all rounded border bg-stone-100 border-stone-200 dark:bg-stone-800 dark:border-stone-700">
                {currentTask?.uuid}
              </code>
            </div>
            <div className="flex gap-1.5 items-center italic text-stone-500">
              <KeyboardKey keys={["Click"]} />
              <span>to copy to clipboard</span>
            </div>
          </div>
        }
        placement="bottom-start"
        offset={0}
      >
        <Button
          variant="info"
          mode="text"
          onClick={() => {
            if (currentTask == null) return;
            navigator.clipboard.writeText(currentTask.uuid);
            toast.success("Task ID copied to clipboard");
          }}
          disabled={currentTask == null}
        >
          Current
        </Button>
      </Tooltip>
    </div>
  );
}

export default function AnnotationProgress({
  currentTask,
  instructions,
  tasks,
  filter,
  fixedFilterFields,
  onNext,
  onPrevious,
  onClearFilterField,
  onGoToTask,
  FilterMenu,
}: {
  currentTask?: AnnotationTask;
  instructions: string;
  tasks: AnnotationTask[];
  filter?: AnnotationTaskFilter;
  fixedFilterFields?: (keyof AnnotationTaskFilter)[];
  onClearFilterField?: (field: keyof AnnotationTaskFilter) => void;
  current?: number | null;
  onNext?: () => void;
  onPrevious?: () => void;
  onGoToTask?: (task: AnnotationTask) => void;
  FilterMenu?: FC<{ close: () => void }>;
}) {
  const {
    missing: pending,
    completed: complete,
    verified,
    needReview,
    total,
  } = useMemo(() => computeAnnotationTasksProgress(tasks), [tasks]);

  const handleSearch = useCallback(
    (value: string | FormEvent<HTMLInputElement>) => {
      let task = tasks.find((t) => t.uuid === value);

      if (task == null) {
        toast.error("Task not found");
        return;
      }

      onGoToTask?.(task);
    },
    [tasks, onGoToTask],
  );

  return (
    <div className="inline-flex gap-1 items-center w-full h-full">
      <Tooltip
        tooltip={
          <div className="inline-flex gap-2 items-center">
            Previous Task
            <div className="text-xs">
              <KeyboardKey keys={["p"]} />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button mode="text" padding="p-1" onClick={onPrevious}>
          <PreviousIcon className="inline-block w-8 h-8" />
        </Button>
      </Tooltip>
      <div className="inline-flex gap-4 items-center px-2 h-full rounded-lg border grow dark:border-stone-800">
        <div className="inline-flex gap-3 items-center">
          <CurrentTask currentTask={currentTask} />
          <span className="inline-flex gap-1 items-center text-sm whitespace-nowrap">
            <span className="text-stone-500">#:</span>
            <span className="font-bold text-blue-500">
              {currentTask != null && tasks.indexOf(currentTask) + 1}
            </span>
          </span>
          <ShortcutHelper shortcuts={SHORTCUTS} />
          <Dialog
            mode="text"
            variant="info"
            title="Annotation Instructions"
            label="Instructions"
            width="max-w-prose"
          >
            {() => (
              <p className="max-w-prose whitespace-pre-wrap">{instructions}</p>
            )}
          </Dialog>
          <span className="inline-flex gap-1 items-center text-sm whitespace-nowrap">
            <span className="text-stone-500">Progress:</span>
            <div className="w-36">
              <ProgressBar
                error={needReview}
                verified={verified}
                total={total}
                complete={complete}
                className="mb-0"
              />
            </div>
          </span>
        </div>
        <span className="inline-flex gap-1 items-center text-sm whitespace-nowrap text-stone-500">
          <span>Remaining:</span>
          <span className="font-medium text-blue-500">{pending}</span>/{total}
        </span>
        <SearchTask onSubmit={handleSearch} />
        <Dialog
          mode="text"
          variant="info"
          title="Task Map"
          label="Map"
          width="max-w-prose"
        >
          {() => (
            <AnnotationTaskBulletList
              tasks={tasks}
              onTaskClick={onGoToTask}
              currentTask={currentTask ?? undefined}
            />
          )}
        </Dialog>
        <FilterButton title="Filter Tasks">
          {({ close }) =>
            FilterMenu == null ? null : <FilterMenu close={close} />
          }
        </FilterButton>
        <div className="overflow-x-auto">
          <FilterBar
            filter={filter}
            withLabel={false}
            filterDef={taskFilterDefs}
            fixedFilterFields={fixedFilterFields ?? []}
            onClearFilterField={onClearFilterField}
          />
        </div>
      </div>
      <Tooltip
        tooltip={
          <div className="inline-flex gap-2 items-center">
            Next Task
            <div className="text-xs">
              <KeyboardKey keys={["n"]} />
            </div>
          </div>
        }
        placement="bottom"
      >
        <Button mode="text" padding="p-1" onClick={onNext}>
          <NextIcon className="inline-block w-8 h-8" />
        </Button>
      </Tooltip>
    </div>
  );
}
