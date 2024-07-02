import DetailLayout from "@/components/layouts/Detail";
import ModelRunUpdateForm from "@/components/model_runs/ModelRunUpdateForm";
import ModelRunEvaluation from "@/components/model_runs/ModelRunEvaluations";
import type { ModelRun, EvaluationSet, Evaluation } from "@/lib/types";

export default function ModelRunDetail(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onDelete?: (data: Promise<ModelRun>) => void;
  onUpdate?: (data: Promise<ModelRun>) => void;
  onEvaluate?: (data: Promise<Evaluation>) => void;
}) {
  return (
    <DetailLayout
      sideBar={
        <ModelRunUpdateForm
          modelRun={props.modelRun}
          onUpdate={props.onUpdate}
          onDelete={props.onDelete}
        />
      }
    >
      <div className="flex flex-col gap-4">
        <ModelRunEvaluation
          modelRun={props.modelRun}
          evaluationSet={props.evaluationSet}
          onEvaluate={props.onEvaluate}
        />
      </div>
    </DetailLayout>
  );
}
