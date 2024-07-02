import Button from "@/lib/components/Button";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import Loading from "@/lib/components/Loading";
import Empty from "@/lib/components/Empty";
import RangeSlider from "@/lib/components/inputs/RangeSlider";
import Toggle from "@/lib/components/inputs/Toggle";
import {
  FilterIcon,
  LoopIcon,
  NextIcon,
  PreviousIcon,
} from "@/lib/components/icons";
import clipEvaluationFilterDef from "@/lib/components/filters/clip_evaluations";
import useExploreClipEvaluations from "@/lib/hooks/evaluation/useExploreClipEvaluations";
import ClipEvaluationDisplay from "@/lib/components/clip_evaluations/ClipEvaluationDisplay";

import type { ClipEvaluationFilter } from "@/lib/api/clip_evaluations";
import type { Filter } from "@/lib/hooks/utils/useFilter";
import type { ClipEvaluation, Interval } from "@/lib/types";

export default function ClipEvaluationExplorer(props: {
  filter?: ClipEvaluationFilter;
  clipEvaluation?: ClipEvaluation;
}) {
  const nav = useExploreClipEvaluations({
    filter: props.filter,
    clipEvaluation: props.clipEvaluation,
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row items-center gap-4">
        <h4 className="text-lg font-bold text-stone-500">Clip Explorer</h4>
        <p className="text-sm text-stone-500">
          Explore each of the evaluated clip.
        </p>
      </div>
      <ExplorerControls
        total={nav.total}
        hasNext={nav.hasNext}
        hasPrev={nav.hasPrev}
        filter={nav.filter}
        random={nav.random}
        next={nav.next}
        prev={nav.prev}
        index={nav.index}
        threshold={nav.threshold}
        onThresholdChange={nav.setThreshold}
        showAnnotations={nav.showAnnotations}
        showPredictions={nav.showPredictions}
        onToggleAnnotations={nav.toggleAnnotations}
        onTogglePredictions={nav.togglePredictions}
      />
      {nav.isLoading ? (
        <Loading />
      ) : nav.clipEvaluation == null ? (
        <Empty>
          <p>No clip predictions found</p>
        </Empty>
      ) : (
        <ClipEvaluationDisplay
          clipEvaluation={nav.clipEvaluation}
          threshold={nav.threshold}
          showAnnotations={nav.showAnnotations}
          showPredictions={nav.showPredictions}
        />
      )}
    </div>
  );
}

function ExplorerControls(props: {
  index?: number | null;
  threshold?: Interval;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  filter: Filter<ClipEvaluationFilter>;
  showAnnotations?: boolean;
  showPredictions?: boolean;
  random: () => void;
  next?: () => void;
  prev?: () => void;
  onThresholdChange?: (threshold: Interval) => void;
  onToggleAnnotations?: () => void;
  onTogglePredictions?: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-2 justify-between">
        <NavigationState index={props.index} total={props.total} />
        <FilterControls {...props} />
        <NavigationControls {...props} />
      </div>
      <div className="flex flex-row items-center gap-2">
        <FilterBar
          filter={props.filter}
          filterDef={clipEvaluationFilterDef}
          showIfEmpty
        />
      </div>
    </div>
  );
}

function NavigationState(props: { index?: number | null; total?: number }) {
  return (
    <div className="inline-flex gap-2">
      <p className="text-sm text-blue-500 font-bold">#{props.index ?? 0}</p>
      <p className="text-sm text-stone-500">{props.total ?? 0} clips</p>
    </div>
  );
}

function FilterControls(props: {
  filter: Filter<ClipEvaluationFilter>;
  threshold?: Interval;
  showAnnotations?: boolean;
  showPredictions?: boolean;
  onThresholdChange?: (threshold: Interval) => void;
  onToggleAnnotations?: () => void;
  onTogglePredictions?: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <FilterMenu
        filter={props.filter}
        filterDef={clipEvaluationFilterDef}
        mode="text"
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block text-sm text-stone-500">
          Annotations:
        </span>
        <Toggle
          label="annotations"
          isSelected={props.showAnnotations}
          onChange={props.onToggleAnnotations}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block text-sm text-stone-500">
          Predictions:
        </span>
        <Toggle
          label="predictions"
          isSelected={props.showPredictions}
          onChange={props.onTogglePredictions}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="inline-block text-sm text-stone-500">Threshold:</span>
        <div className="w-40">
          <RangeSlider
            label="threshold"
            minValue={0}
            maxValue={1}
            step={0.05}
            formatter={(val) => val.toFixed(2)}
            value={[props.threshold?.min ?? 0, props.threshold?.max ?? 1]}
            onChange={(val) => {
              const [minVal, maxVal] = val as [number, number];
              props.onThresholdChange?.({ min: minVal, max: maxVal });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NavigationControls(props: {
  hasNext?: boolean;
  hasPrev?: boolean;
  random: () => void;
  next?: () => void;
  prev?: () => void;
}) {
  return (
    <div className="inline-flex gap-2">
      <Button mode="text" onClick={props.prev} disabled={!props.hasPrev}>
        <PreviousIcon className="w-6 h-6" />
      </Button>
      <Button
        mode="text"
        onClick={props.random}
        disabled={!props.hasPrev && !props.hasNext}
      >
        <LoopIcon className="w-6 h-6" />
      </Button>
      <Button mode="text" onClick={props.next} disabled={!props.hasNext}>
        <NextIcon className="w-6 h-6" />
      </Button>
    </div>
  );
}
