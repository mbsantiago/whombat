import { useMemo } from "react";

import Card from "@/components/Card";
import ClipPredictionExplorer from "@/components/clip_predictions/ClipPredictionExplorer";
import { H4 } from "@/components/Headings";

import type { ModelRun } from "@/types";

export default function ModelRunPredictions(props: { modelRun: ModelRun }) {
  const filter = useMemo(
    () => ({
      model_run: props.modelRun,
    }),
    [props.modelRun],
  );

  return (
    <Card>
      <div>
        <H4>Predictions</H4>
        <span className="text-stone-500 text-sm">
          Search for predictions here
        </span>
      </div>
      <div>
        <ClipPredictionExplorer filter={filter} />
      </div>
    </Card>
  );
}
