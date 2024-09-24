import EvaluationComponent from "@/lib/components/evaluations/Evaluation";
import Button from "@/lib/components/ui/Button";
import Card from "@/lib/components/ui/Card";
import Empty from "@/lib/components/ui/Empty";
import { H4 } from "@/lib/components/ui/Headings";
import Loading from "@/lib/components/ui/Loading";

import type { Evaluation, EvaluationSet, ModelRun } from "@/lib/types";

export default function ModelRunEvaluation(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  evaluation?: Evaluation;
  isLoading?: boolean;
  onEvaluate?: () => void;
}) {
  return (
    <Card>
      <div className="flex justify-between">
        <div>
          <H4>Evaluation</H4>
          <span className="text-sm text-stone-500">
            Here you can see the evaluation for this model predictions when
            compared against the evaluation set.
          </span>
        </div>
        <div className="flex items-center">
          {props.isLoading ? (
            <Button
              mode="text"
              variant="secondary"
              onClick={props.onEvaluate}
              disabled
            >
              Evaluate
            </Button>
          ) : props.evaluation == null ? (
            <Button mode="text" onClick={props.onEvaluate}>
              Evaluate
            </Button>
          ) : (
            <Button mode="text" onClick={props.onEvaluate}>
              Update
            </Button>
          )}
        </div>
      </div>
      <div className="mt-4">
        {props.isLoading ? (
          <Loading />
        ) : props.evaluation == null ? (
          <NoEvaluation />
        ) : (
          <EvaluationComponent evaluation={props.evaluation} />
        )}
      </div>
    </Card>
  );
}

function NoEvaluation() {
  return (
    <Empty>
      <p>
        This model run has not been evaluated yet! Evaluate this model run by
        clicking the
        <span className="text-emerald-500"> Evaluate </span>
        button above.
      </p>
    </Empty>
  );
}
