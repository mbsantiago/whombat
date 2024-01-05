import DetailLayout from "@/components/layouts/Detail";
import ModelRunPredictions from "@/components/model_runs/ModelRunPredictions";
import ModelRunUpdateForm from "@/components/model_runs/ModelRunUpdateForm";
import ModelRunEvaluations from "@/components/model_runs/ModelRunEvaluations";
import type { ModelRun, EvaluationSet } from "@/types";

export default function ModelRunDetail(props: {
  modelRun: ModelRun;
  evaluationSet: EvaluationSet;
  onDelete?: (data: Promise<ModelRun>) => void;
  onUpdate?: (data: Promise<ModelRun>) => void;
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
        <ModelRunEvaluations
          modelRun={props.modelRun}
          evaluationSet={props.evaluationSet}
        />
        <ModelRunPredictions modelRun={props.modelRun} />
      </div>
    </DetailLayout>
  );
}
