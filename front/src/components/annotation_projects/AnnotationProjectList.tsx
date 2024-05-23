import Loading from "@/app/loading";
import AnnotationProjectComponent from "@/components/annotation_projects/AnnotationProject";
import AnnotationProjectCreate from "@/components/annotation_projects/AnnotationProjectCreate";
import AnnotationProjectImport from "@/components/annotation_projects/AnnotationProjectImport";
import Dialog from "@/components/Dialog";
import Empty from "@/components/Empty";
import {
  AddIcon,
  DatasetIcon,
  UploadIcon,
  WarningIcon,
} from "@/components/icons";
import Search from "@/components/inputs/Search";
import Pagination from "@/components/lists/Pagination";
import StackedList from "@/components/lists/StackedList";
import useAnnotationProjects from "@/hooks/api/useAnnotationProjects";

import type { AnnotationProject } from "@/types";

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

export default function AnnotationProjectList({
  onCreate,
}: {
  onCreate?: (annotationProject: Promise<AnnotationProject>) => void;
}) {
  const { items, pagination, isLoading, filter } = useAnnotationProjects();

  return (
    <div className="flex flex-col p-8 space-y-2 w-full">
      <div className="flex flex-row space-x-4">
        <div className="flex-grow">
          <Search
            label="Search"
            placeholder="Search project..."
            value={filter.get("search")}
            onChange={(value) => filter.set("search", value as string)}
            onSubmit={() => filter.submit()}
            icon={<DatasetIcon />}
          />
        </div>
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
            {() => <AnnotationProjectCreate onCreate={onCreate} />}
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
            {() => <AnnotationProjectImport onCreate={onCreate} />}
          </Dialog>
        </div>
      </div>
      {isLoading ? (
        <Empty>
          <div className="p-8">
            <Loading />
          </div>
        </Empty>
      ) : items.length === 0 ? (
        <NoProjects />
      ) : (
        <>
          <StackedList
            items={items.map((item) => (
              <AnnotationProjectComponent
                key={item.uuid}
                annotationProject={item}
              />
            ))}
          />
        </>
      )}
      {pagination.numPages > 1 && <Pagination {...pagination} />}
    </div>
  );
}
