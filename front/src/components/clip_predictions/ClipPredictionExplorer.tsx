import Button from "@/components/Button";
import FilterBar from "@/components/filters/FilterBar";
import FilterMenu from "@/components/filters/FilterMenu";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import RangeSlider from "@/components/inputs/RangeSlider";
import {
  FilterIcon,
  LoopIcon,
  NextIcon,
  PreviousIcon,
} from "@/components/icons";
import clipPredictionFilterDef from "@/components/filters/clip_predictions";
import useExploreClipPredictions from "@/hooks/prediction/useExploreClipPredictions";
import ClipPredictionDisplay from "@/components/clip_predictions/ClipPredictionDisplay";

import type { ClipPredictionFilter } from "@/lib/api/clip_predictions";
import type { Filter } from "@/hooks/utils/useFilter";
import type { ClipPrediction, Interval } from "@/types";

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
      <div className="flex flex-row items-center gap-2 justify-between">
        <NavigationState index={props.index} total={props.total} />
        <FilterControls {...props} />
        <NavigationControls {...props} />
      </div>
      <div className="flex flex-row items-center gap-2">
        <FilterBar
          filter={props.filter}
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
      <p className="text-sm text-blue-500 font-bold">#{props.index ?? 0}</p>
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
        filter={props.filter}
        filterDef={clipPredictionFilterDef}
        mode="text"
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
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
