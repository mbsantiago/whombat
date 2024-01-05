import { useMemo } from "react";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import Empty from "@/components/Empty";
import Dialog from "@/components/Dialog";
import { AddIcon } from "@/components/icons";
import { H4 } from "@/components/Headings";
import ModelRunEvaluate from "@/components/model_runs/ModelRunEvaluate";
import useEvaluations from "@/hooks/api/useEvaluations";
import type { ModelRun, EvaluationSet } from "@/types";

function NoEvaluation() {
  return (
    <Empty>
      No evaluations for this model run. Create a new evaluation by clicking the
      button above.
    </Empty>
  );
}

export default function ModelRunEvaluations(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onEvaluate?: () => void;
}) {
  const filter = useMemo(
    () => ({ model_run: props.modelRun }),
    [props.modelRun],
  );

  const { items: evaluations, isLoading } = useEvaluations({
    filter,
  });

  return (
    <Card>
      <div className="flex justify-between">
        <div>
          <H4>Evaluations</H4>
          <span className="text-stone-500 text-sm">
            Here you can see the evaluations for this model run.
          </span>
        </div>
        <div className="flex items-center">
          <Dialog
            mode="text"
            title="Evaluation model run"
            label={
              <>
                <AddIcon className="w-4 h-4 mr-2" />
                Create evaluation
              </>
            }
          >
            {() => (
              <ModelRunEvaluate
                evaluationSet={props.evaluationSet}
                modelRun={props.modelRun}
                onEvaluate={props.onEvaluate}
              />
            )}
          </Dialog>
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <Loading />
        ) : evaluations.length == 0 ? (
          <NoEvaluation />
        ) : (
          <ul>
            {evaluations.map((evaluation) => (
              <li key={evaluation.uuid}>{evaluation.task}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
