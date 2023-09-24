import ProgressBar from "@/components/ProgressBar";
import FilterMenu from "@/components/FilterMenu";
import FilterBar from "@/components/FilterBar";
import { FilterIcon } from "@/components/icons";
import { type Filter } from "@/hooks/api/useFilter";
import { type TaskFilter } from "@/api/tasks";
import Toggle from "@/components/Toggle";
import { getButtonClassName } from "@/components/Button";
import taskFilterDefs from "@/components/filters/tasks";

export default function AnnotationProgress({
  pending,
  complete,
  filter,
}: {
  pending: number;
  complete: number;
  filter: Filter<TaskFilter>;
}) {
  return (
    <div className="flex flex-row gap-4 items-center rounded-lg border dark:border-stone-800 px-2 py-1">
      <span className="dark:text-stone-400 text-stone-600">Progress:</span>
      <div className="w-48">
        <ProgressBar
          total={pending + complete}
          complete={complete}
          className="mb-0"
        />
      </div>
      <span className="text-stone-500 text-sm whitespace-nowrap align-middle">
        Pending: <span className="text-blue-500 font-medium">{pending}</span>
      </span>
      <div className="flex flex-row items-center gap-1">
        <span className="text-stone-500 text-sm">
          Only pending tasks:
        </span>
        <Toggle
          label="Only Pending"
          checked={filter.get("pending__eq") ?? false}
          onChange={(checked) => {
            if (checked) {
              filter.set("pending__eq", checked, true);
            } else {
              filter.clear("pending__eq", true);
            }
          }}
        />
      </div>
      <FilterMenu
        filter={filter}
        filterDefs={taskFilterDefs}
        className={getButtonClassName({
          variant: "info",
          mode: "text",
          padding: "p-1",
        })}
        button={
          <>
            <FilterIcon className="w-5 h-5 inline-block mr-1" />
            <span className="text-sm whitespace-nowrap align-middle">
              Other Filters
            </span>
          </>
        }
      />
      <FilterBar withLabel={false} filter={filter} />
    </div>
  );
}
