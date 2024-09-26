import Empty from "@/lib/components/ui/Empty";
import Loading from "@/lib/components/ui/Loading";

import type { AnnotationTask } from "@/lib/types";

import DetailLayout from "../layouts/Detail";

export default function AnnotationTask(props: {
  selectedTask: AnnotationTask | null;
  isLoading?: boolean;
  Progress?: JSX.Element;
  TagPalette?: JSX.Element;
  TaskStatus?: JSX.Element;
  Context?: JSX.Element;
  Spectrogram?: JSX.Element;
  SoundEvents?: JSX.Element;
  ClipTags?: JSX.Element;
  ClipNotes?: JSX.Element;
}) {
  return (
    <DetailLayout
      Actions={props.TaskStatus}
      SideBar={
        <div className="flex flex-col gap-2 w-full">
          {props.TagPalette}
          {props.ClipTags}
          {props.ClipNotes}
        </div>
      }
      MainContent={
        <div className="flex flex-col gap-2">
          {props.Progress}
          {props.isLoading ? (
            <Loading />
          ) : props.selectedTask == null ? (
            <NoTaskSelected />
          ) : (
            <>
              {props.Context}
              {props.Spectrogram}
              {props.SoundEvents}
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
