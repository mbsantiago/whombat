import * as icons from "@/lib/components/icons";
import ModelRunItem from "@/lib/components/model_runs/ModelRunItem";
import * as ui from "@/lib/components/ui";

import type * as types from "@/lib/types";

export default function ModelEvaluationSummary({
  modelRuns,
  isLoading = false,
  onAddModelRuns,
  onClickModelRun,
}: {
  modelRuns: types.ModelRun[];
  isLoading?: boolean;
  onAddModelRuns?: () => void;
  onClickModelRun?: (modelRun: types.ModelRun) => void;
}) {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <ui.H4>
          <icons.ModelIcon className="inline-block mr-2 w-5 h-5" />
          Model Runs
        </ui.H4>
        <ui.Button mode="text" variant="primary" onClick={onAddModelRuns}>
          <icons.AddIcon className="inline-block mr-2 w-5 h-5" /> Add Model Run
        </ui.Button>
      </div>
      {isLoading ? (
        <ui.Loading />
      ) : modelRuns.length > 0 ? (
        <ul className="flex flex-col gap-4 list-disc list-inside">
          {modelRuns.map((modelRun) => (
            <ModelRunItem
              key={modelRun.uuid}
              modelRun={modelRun}
              onClick={() => onClickModelRun?.(modelRun)}
            />
          ))}
        </ul>
      ) : (
        <ui.Empty>No model evaluations found</ui.Empty>
      )}
    </div>
  );
}
