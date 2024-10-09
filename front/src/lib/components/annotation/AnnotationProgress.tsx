import { FC, useMemo } from "react";

import ShortcutHelper from "@/lib/components/ShortcutHelper";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterButton from "@/lib/components/filters/FilterButton";
import taskFilterDefs from "@/lib/components/filters/tasks";
import { NextIcon, PreviousIcon } from "@/lib/components/icons";
import Toggle from "@/lib/components/inputs/Toggle";
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

const SHORTCUTS: Shortcut[] = [];

export default function AnnotationProgress({
  current,
  instructions,
  tasks,
  filter,
  fixedFilterFields,
  onNext,
  onPrevious,
  onSetFilterField,
  onClearFilterField,
  FilterMenu,
}: {
  instructions: string;
  tasks: AnnotationTask[];
  filter?: AnnotationTaskFilter;
  fixedFilterFields?: (keyof AnnotationTaskFilter)[];
  onSetFilterField?: <K extends keyof AnnotationTaskFilter>(
    key: K,
    value: AnnotationTaskFilter[K],
  ) => void;
  onClearFilterField?: (field: keyof AnnotationTaskFilter) => void;
  current?: number | null;
  onNext?: () => void;
  onPrevious?: () => void;
  FilterMenu?: FC<{ close: () => void }>;
}) {
  const {
    missing: pending,
    completed: complete,
    verified,
    needReview,
    total,
  } = useMemo(() => computeAnnotationTasksProgress(tasks), [tasks]);

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
            <span className="text-stone-500">#:</span>
            <span className="font-bold text-blue-500">{current}</span>
          </span>
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
        <div className="inline-flex gap-1 items-center">
          <span className="text-sm text-stone-500">Pending:</span>
          <Toggle
            label="Only Pending"
            isSelected={filter?.pending ?? false}
            onChange={(checked) => {
              if (checked) {
                onSetFilterField?.("pending", checked);
              } else {
                onSetFilterField?.("pending", false);
              }
            }}
          />
        </div>
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
