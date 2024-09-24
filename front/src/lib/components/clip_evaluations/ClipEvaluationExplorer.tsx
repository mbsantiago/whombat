import Slider from "@/lib/components/inputs/Slider";
import Toggle from "@/lib/components/inputs/Toggle";
import * as ui from "@/lib/components/ui";

export default function ClipEvaluationExplorer(props: {
  isLoading?: boolean;
  isEmpty?: boolean;
  FilterControls?: JSX.Element;
  NavigationControls?: JSX.Element;
  FilterBar?: JSX.Element;
  ClipEvaluation?: JSX.Element;
}) {
  return (
    <ui.Card className="flex flex-col gap-2 w-full">
      <ui.H4 className="text-lg font-bold text-stone-500">Clip Explorer</ui.H4>
      <p className="text-sm text-stone-500">
        Explore each of the evaluated clips.
      </p>
      <div className="flex flex-col">
        <div className="flex flex-row gap-2 justify-between items-center">
          {props.NavigationControls}
          {props.FilterControls}
        </div>
        <div className="flex flex-row gap-2 items-center">
          {props.FilterBar}
        </div>
      </div>
      {props.isLoading ? (
        <ui.Loading />
      ) : props.isEmpty ? (
        <ui.Empty>
          <p>No clip predictions found</p>
        </ui.Empty>
      ) : (
        props.ClipEvaluation
      )}
    </ui.Card>
  );
}

export function FilterControls(props: {
  threshold?: number;
  showAnnotations?: boolean;
  showPredictions?: boolean;
  onThresholdChange?: (threshold: number) => void;
  onToggleAnnotations?: () => void;
  onTogglePredictions?: () => void;
  FilterMenu?: JSX.Element;
}) {
  return (
    <div className="inline-flex gap-4 items-center">
      {props.FilterMenu}
      <div className="inline-flex gap-1 items-center">
        <span className="inline-block text-sm text-stone-500">
          Show Annotations:
        </span>
        <Toggle
          label="annotations"
          isSelected={props.showAnnotations}
          onChange={props.onToggleAnnotations}
        />
      </div>
      <div className="inline-flex gap-1 items-center">
        <span className="inline-block text-sm text-stone-500">
          Show Predictions:
        </span>
        <Toggle
          label="predictions"
          isSelected={props.showPredictions}
          onChange={props.onTogglePredictions}
        />
      </div>
      <div className="inline-flex gap-1 items-center">
        <span className="inline-block text-sm text-stone-500">Threshold:</span>
        <div className="inline-flex items-center w-40">
          <Slider
            label="threshold"
            minValue={0}
            maxValue={1}
            step={0.05}
            formatter={(val) => val.toFixed(2)}
            value={props.threshold}
            onChange={(val) => props.onThresholdChange?.(val as number)}
          />
        </div>
      </div>
    </div>
  );
}
