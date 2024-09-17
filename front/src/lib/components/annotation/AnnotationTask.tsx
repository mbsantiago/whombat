import DetailLayout from "../layouts/Detail";
import Empty from "@/lib/components/Empty";
import Loading from "@/lib/components/ui/Loading";
import type { AnnotationTask } from "@/lib/types";

export default function AnnotationTask(props: {
  selectedTask: AnnotationTask | null;
  isLoading?: boolean;
  AnnotationProgress?: JSX.Element;
  AnnotationTagPalette?: JSX.Element;
  AnnotationTaskStatus?: JSX.Element;
  AnnotationContext?: JSX.Element;
  AnnotationTaskSpectrogram?: JSX.Element;
  AnnotationTaskSoundEvents?: JSX.Element;
  AnnotationTaskTags?: JSX.Element;
  AnnotationTaskNotes?: JSX.Element;
}) {
  return (
    <DetailLayout
      Actions={props.AnnotationTaskStatus}
      SideBar={
        <div className="flex flex-col gap-2 w-full">
          {props.AnnotationTagPalette}
          {props.AnnotationTaskTags}
          {props.AnnotationTaskNotes}
        </div>
      }
      MainContent={
        <div className="flex flex-col gap-2">
          {props.AnnotationProgress}
          {props.isLoading ? (
            <Loading />
          ) : props.selectedTask == null ? (
            <NoTaskSelected />
          ) : (
            <>
              {props.AnnotationContext}
              {props.AnnotationTaskSpectrogram}
              {props.AnnotationTaskSoundEvents}
            </>
          )}
        </div>
      }
    />
  );
}

function NoTaskSelected() {
  return <Empty>No task selected</Empty>;
}
