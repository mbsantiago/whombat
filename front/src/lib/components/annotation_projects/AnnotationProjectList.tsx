import Loading from "@/app/loading";
import AnnotationProjectComponent from "@/lib/components/annotation_projects/AnnotationProject";
import Dialog from "@/lib/components/ui/Dialog";
import Empty from "@/lib/components/Empty";
import { AddIcon, UploadIcon, WarningIcon } from "@/lib/components/icons";
import StackedList from "@/lib/components/lists/StackedList";
import type { AnnotationProject } from "@/lib/types";

export default function AnnotationProjectList({
  annotationProjects,
  isLoading = false,
  AnnotationProjectSearch,
  AnnotationProjectCreate,
  AnnotationProjectImport,
  Pagination,
  onClickAnnotationProject,
}: {
  annotationProjects: AnnotationProject[];
  isLoading?: boolean;
  onClickAnnotationProject?: (annotationProject: AnnotationProject) => void;
  AnnotationProjectSearch: JSX.Element;
  AnnotationProjectCreate: JSX.Element;
  AnnotationProjectImport: JSX.Element;
  Pagination: JSX.Element;
}) {
  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">{AnnotationProjectSearch}</div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Create Annotation Project"
            width="w-96"
            label={
              <>
                <AddIcon className="inline-block w-4 h-4 align-middle" /> Create
              </>
            }
          >
            {() => AnnotationProjectCreate}
          </Dialog>
        </div>
        <div className="h-full">
          <Dialog
            mode="text"
            title="Import annotation project"
            label={
              <>
                <UploadIcon className="inline-block w-4 h-4 align-middle" />{" "}
                Import
              </>
            }
          >
            {() => AnnotationProjectImport}
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <Empty>
          <div className="p-8">
            <Loading />
          </div>
        </Empty>
      ) : annotationProjects.length === 0 ? (
        <NoProjects />
      ) : (
        <>
          <StackedList
            items={annotationProjects.map((item) => (
              <AnnotationProjectComponent
                key={item.uuid}
                annotationProject={item}
                onClickAnnotationProject={() => onClickAnnotationProject?.(item)}
              />
            ))}
          />
        </>
      )}
      {Pagination}
    </div>
  );
}

function NoProjects() {
  return (
    <Empty>
      <WarningIcon className="w-16 h-16 text-stone-500" />
      <p>No annotation project exist yet!</p>
      <p>
        To create a new project, click on the
        <span className="text-emerald-500">
          <AddIcon className="inline-block mr-1 ml-2 w-4 h-4" />
          Create{" "}
        </span>{" "}
        button above.
      </p>
    </Empty>
  );
}
