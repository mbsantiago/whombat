import DetailLayout from "@/lib/components/layouts/Detail";
import ModelRunEvaluation from "@/lib/components/model_runs/ModelRunEvaluations";
import ModelRunUpdateForm from "@/lib/components/model_runs/ModelRunUpdateForm";
import type { Evaluation, EvaluationSet, ModelRun } from "@/lib/types";

export default function ModelRunDetail(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onDelete?: (data: Promise<ModelRun>) => void;
  onUpdate?: (data: Promise<ModelRun>) => void;
  onEvaluate?: (data: Promise<Evaluation>) => void;
}) {
  return (
    <DetailLayout
      SideBar={
        <ModelRunUpdateForm
          modelRun={props.modelRun}
          onUpdate={props.onUpdate}
          onDelete={props.onDelete}
        />
      }
      MainContent={
        <div className="flex flex-col gap-4">
          <ModelRunEvaluation
            modelRun={props.modelRun}
            evaluationSet={props.evaluationSet}
            onEvaluate={props.onEvaluate}
          />
        </div>
      }
    />
  );
}
