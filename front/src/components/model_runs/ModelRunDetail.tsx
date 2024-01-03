import DetailLayout from "@/components/layouts/Detail";
import ModelRunPredictions from "@/components/model_runs/ModelRunPredictions";
import ModelRunUpdateForm from "@/components/model_runs/ModelRunUpdateForm";
import type { ModelRun } from "@/types";

export default function ModelRunDetail(props: {
  modelRun: ModelRun;
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
      <ModelRunPredictions modelRun={props.modelRun} />
    </DetailLayout>
  );
}
