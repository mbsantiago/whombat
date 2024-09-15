import DetailLayout from "../layouts/Detail";

export default function AnnotationProjectDetail(props: {
  AnnotationProjectProgress: JSX.Element;
  AnnotationProjectTagsSummary: JSX.Element;
  AnnotationProjectNotesSummary: JSX.Element;
  AnnotationProjectActions: JSX.Element;
  AnnotationProjectUpdate: JSX.Element;
}) {
  return (
    <DetailLayout
      MainContent={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="col-span-1 lg:col-span-2">
            {props.AnnotationProjectProgress}
          </div>
          {props.AnnotationProjectTagsSummary}
          {props.AnnotationProjectNotesSummary}
        </div>
      }
      Actions={props.AnnotationProjectActions}
      SideBar={props.AnnotationProjectUpdate}
    />
  );
}
