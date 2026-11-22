import annotationTaskFilterDefs from "@/lib/components/filters/annotation_tasks";
import FilterBar from "@/lib/components/filters/FilterBar";
import FilterPopover from "@/lib/components/filters/FilterMenu";
import Search from "@/lib/components/inputs/Search";
import type { AnnotationTaskFilter } from "@/lib/types";

export default function AnnotationTaskFilters({
  filter,
  total,
}: {
  filter: {
    get: (key: keyof AnnotationTaskFilter) => unknown;
    set: <T extends keyof AnnotationTaskFilter>(
      key: T,
      value: AnnotationTaskFilter[T],
    ) => void;
    clear: (key: keyof AnnotationTaskFilter) => void;
    filter: AnnotationTaskFilter;
    fixed: (keyof AnnotationTaskFilter)[];
  };
  total: number;
}) {
  return (
    <>
      <div className="flex flex-row justify-between space-x-4">
        <div className="flex flex-row space-x-3 basis-1/2">
          <div className="grow">
            <Search
              label="Search"
              placeholder="Search recordings..."
              value={(filter.get("search_recordings") as string) ?? ""}
              onChange={(value) =>
                filter.set("search_recordings", value as string)
              }
            />
          </div>
          <FilterPopover
            onSetFilterField={filter.set}
            filterDef={annotationTaskFilterDefs}
          />
        </div>
      </div>
      <FilterBar
        filter={filter.filter}
        onClearFilterField={filter.clear}
        fixedFilterFields={filter.fixed}
        total={total}
        filterDef={annotationTaskFilterDefs}
      />
    </>
  );
}
