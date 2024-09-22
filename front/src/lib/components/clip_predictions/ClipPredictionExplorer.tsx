import Empty from "@/lib/components/Empty";
import ClipPredictionDisplay from "@/lib/components/clip_predictions/ClipPredictionDisplay";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import clipPredictionFilterDef from "@/lib/components/filters/clip_predictions";
import {
  FilterIcon,
  LoopIcon,
  NextIcon,
  PreviousIcon,
} from "@/lib/components/icons";
import RangeSlider from "@/lib/components/inputs/RangeSlider";
import Button from "@/lib/components/ui/Button";
import Loading from "@/lib/components/ui/Loading";

import useExploreClipPredictions from "@/lib/hooks/prediction/useExploreClipPredictions";
import type { Filter } from "@/lib/hooks/utils/useFilter";

import type { ClipPredictionFilter } from "@/lib/api/clip_predictions";
import type { ClipPrediction, Interval } from "@/lib/types";

export default function ClipPredictionExplorer(props: {
  filter?: ClipPredictionFilter;
  clipPrediction?: ClipPrediction;
}) {
  const nav = useExploreClipPredictions({
    filter: props.filter,
    clipPrediction: props.clipPrediction,
  });

  return (
    <div className="flex flex-col gap-2 w-full">
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
      />
      <div>
        {nav.isLoading ? (
          <Loading />
        ) : nav.clipPrediction == null ? (
          <Empty>
            <p>No clip predictions found</p>
          </Empty>
        ) : (
          <ClipPredictionDisplay
            clipPrediction={nav.clipPrediction}
            threshold={nav.threshold}
          />
        )}
      </div>
    </div>
  );
}

function ExplorerControls(props: {
  index?: number | null;
  threshold?: Interval;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  filter: Filter<ClipPredictionFilter>;
  random: () => void;
  next?: () => void;
  prev?: () => void;
  onThresholdChange?: (threshold: Interval) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-2 justify-between items-center">
        <NavigationState index={props.index} total={props.total} />
        <FilterControls {...props} />
        <NavigationControls {...props} />
      </div>
      <div className="flex flex-row gap-2 items-center">
        <FilterBar
          filter={props.filter.filter}
          onClearFilterField={props.filter.clear}
          fixedFilterFields={props.filter.fixed}
          filterDef={clipPredictionFilterDef}
          showIfEmpty
        />
      </div>
    </div>
  );
}

function NavigationState(props: { index?: number | null; total?: number }) {
  return (
    <div className="inline-flex gap-2">
      <p className="text-sm font-bold text-blue-500">#{props.index ?? 0}</p>
      <p className="text-sm text-stone-500">{props.total ?? 0} predictions</p>
    </div>
  );
}

function FilterControls(props: {
  filter: Filter<ClipPredictionFilter>;
  threshold?: Interval;
  onThresholdChange?: (threshold: Interval) => void;
}) {
  return (
    <div className="inline-flex gap-2">
      <FilterMenu
        onSetFilterField={props.filter.set}
        filterDef={clipPredictionFilterDef}
        mode="text"
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
      <div className="flex flex-row gap-2 items-center">
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
