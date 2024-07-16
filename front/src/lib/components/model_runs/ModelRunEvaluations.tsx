import { useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

import api from "@/app/api";
import useEvaluations from "@/app/hooks/api/useEvaluations";
import { H4 } from "@/lib/components/ui/Headings";
import Card from "@/lib/components/ui/Card";
import Loading from "@/lib/components/ui/Loading";
import Empty from "@/lib/components/Empty";
import Button from "@/lib/components/ui/Button";
import EvaluationComponent from "@/lib/components/evaluations/Evaluation";
import ClipEvaluationExplorer from "@/lib/components/clip_evaluations/ClipEvaluationExplorer";

import type { ModelRun, EvaluationSet, Evaluation } from "@/lib/types";

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

export default function ModelRunEvaluation(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onEvaluate?: (data: Promise<Evaluation>) => void;
}) {
  const filter = useMemo(
    () => ({ model_run: props.modelRun, evaluation_set: props.evaluationSet }),
    [props.modelRun, props.evaluationSet],
  );

  const { items: evaluations, isLoading } = useEvaluations({
    filter,
    pageSize: 1,
  });

  const evaluation = evaluations[0];

  const onMutate = useCallback(() => {
    return api.modelRuns.evaluate(props.modelRun, props.evaluationSet);
  }, [props.modelRun, props.evaluationSet]);

  const { mutateAsync: evaluateModelRun } = useMutation({
    mutationFn: onMutate,
  });

  const { onEvaluate } = props;
  const handleEvaluate = useCallback(async () => {
    const promise = evaluateModelRun();
    onEvaluate?.(promise);
  }, [evaluateModelRun, onEvaluate]);

  const clipsFilter = useMemo(
    () => ({
      evaluation,
    }),
    [evaluation],
  );

  return (
    <>
      <Card>
        <div className="flex justify-between">
          <div>
            <H4>Evaluation</H4>
            <span className="text-stone-500 text-sm">
              Here you can see the evaluation for this model predictions when
              compared against the evaluation set.
            </span>
          </div>
          <div className="flex items-center">
            {isLoading ? (
              <Button disabled>
                <Loading />
              </Button>
            ) : evaluation == null ? (
              <Button mode="text" onClick={handleEvaluate}>
                Evaluate
              </Button>
            ) : (
              <Button mode="text" onClick={handleEvaluate}>
                Update
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4">
          {isLoading ? (
            <Loading />
          ) : evaluation == null ? (
            <NoEvaluation />
          ) : (
            <EvaluationComponent evaluation={evaluation} />
          )}
        </div>
      </Card>
      <Card>
        {isLoading ? (
          <Loading />
        ) : evaluation == null ? (
          <NoEvaluation />
        ) : (
          <ClipEvaluationExplorer filter={clipsFilter} />
        )}
      </Card>
    </>
  );
}
