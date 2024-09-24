import useAnnotationTasks from "@/app/hooks/api/useAnnotationTasks";

import Loading from "@/app/loading";

import FilterBar from "@/lib/components/filters/FilterBar";
import FilterPopover from "@/lib/components/filters/FilterMenu";
import annotationTaskFilterDefs from "@/lib/components/filters/annotation_tasks";
import Search from "@/lib/components/inputs/Search";
import Pagination from "@/lib/components/lists/Pagination";
import Table from "@/lib/components/tables/Table";

import useAnnotationTaskTable from "@/lib/hooks/useAnnotationTaskTable";

import type { AnnotationTask, AnnotationTaskFilter } from "@/lib/types";

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
      <div className="flex flex-row justify-between space-x-4">
        <div className="flex flex-row space-x-3 basis-1/2">
          <div className="grow">
            <Search
              label="Search"
              placeholder="Search recordings..."
              value={annotationTasks.filter.get("search_recordings") ?? ""}
              onChange={(value) =>
                annotationTasks.filter.set("search_recordings", value as string)
              }
            />
          </div>
          <FilterPopover
            onSetFilterField={annotationTasks.filter.set}
            filterDef={annotationTaskFilterDefs}
          />
        </div>
      </div>
      <FilterBar
        filter={annotationTasks.filter.filter}
        onClearFilterField={annotationTasks.filter.clear}
        fixedFilterFields={annotationTasks.filter.fixed}
        total={annotationTasks.total}
        filterDef={annotationTaskFilterDefs}
      />
      <div className="w-full">
        <div className="overflow-x-auto overflow-y-auto w-full max-h-screen rounded-md outline outline-1 outline-stone-200 dark:outline-stone-800">
          <Table table={table} />
        </div>
      </div>
      <Pagination {...annotationTasks.pagination} />
    </div>
  );
}
