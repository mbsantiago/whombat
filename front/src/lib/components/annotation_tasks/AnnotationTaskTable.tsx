import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";
import Loading from "@/app/loading";
import Pagination from "@/lib/components/lists/Pagination";
import Table from "@/lib/components/tables/Table";
import useAnnotationTaskTable from "@/lib/hooks/useAnnotationTaskTable";
import type { AnnotationTask, AnnotationTaskFilter } from "@/lib/types";
import AnnotationTaskFilters from "./AnnotationTaskFilters";

export default function AnnotationTaskTable({
  filter,
  fixed,
  getAnnotationTaskLink,
  pathFormatter,
}: {
  filter: AnnotationTaskFilter;
  fixed?: (keyof AnnotationTaskFilter)[];
  getAnnotationTaskLink?: (annotationTask: AnnotationTask) => string;
  pathFormatter?: (path: string) => string;
}) {
  const annotationTasks = useAnnotationTasks({ filter, fixed });

  const table = useAnnotationTaskTable({
    data: annotationTasks.items,
    getAnnotationTaskLink: getAnnotationTaskLink,
    pathFormatter,
  });

  if (annotationTasks.isLoading || annotationTasks.data == null) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <AnnotationTaskFilters
        filter={annotationTasks.filter}
        total={annotationTasks.total}
      />
      <div className="w-full">
        <div className="overflow-x-auto overflow-y-auto w-full max-h-screen rounded-md outline-solid outline-1 outline-stone-200 dark:outline-stone-800">
          <Table table={table} />
        </div>
      </div>
      <Pagination {...annotationTasks.pagination} />
    </div>
  );
}
