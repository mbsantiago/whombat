import ProgressBar from "@/components/ProgressBar";
import FilterMenu from "@/components/FilterMenu";
import FilterBar from "@/components/FilterBar";
import Button from "@/components/Button";
import { FilterIcon, NextIcon, PreviousIcon } from "@/components/icons";
import { type Filter } from "@/hooks/api/useFilter";
import { type TaskFilter } from "@/api/tasks";
import Toggle from "@/components/Toggle";
import Tooltip from "@/components/Tooltip";
import { getButtonClassName } from "@/components/Button";
import taskFilterDefs from "@/components/filters/tasks";

export default function AnnotationProgress({
  pending,
  complete,
  filter,
  next,
  previous,
}: {
  pending: number;
  complete: number;
  filter: Filter<TaskFilter>;
  next: () => void;
  previous: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 w-100">
      <Tooltip tooltip="Previous Task" placement="bottom">
        <Button mode="text" padding="p-1" onClick={previous}>
          <PreviousIcon className="w-5 h-5 inline-block" />
        </Button>
      </Tooltip>
      <div className="inline-flex gap-4 items-center rounded-lg border dark:border-stone-800 px-2 py-1 grow">
        <div className="inline-flex items-center gap-1">
          <span className="text-stone-500 text-sm">Progress:</span>
          <div className="w-36">
            <ProgressBar
              total={pending + complete}
              complete={complete}
              className="mb-0"
            />
          </div>
        </div>
        <span className="text-stone-500 text-sm whitespace-nowrap align-middle">
          Remaining: <span className="text-blue-500 font-medium">{pending}</span>
        </span>
        <div className="inline-flex items-center gap-1">
          <span className="text-stone-500 text-sm">Pending:</span>
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
                Filters
              </span>
            </>
          }
        />
        <div className="overflow-x-scroll">
          <FilterBar withLabel={false} filter={filter} />
        </div>
      </div>
      <Tooltip tooltip="Next Task" placement="bottom">
        <Button mode="text" padding="p-1" onClick={next}>
          <NextIcon className="w-5 h-5 inline-block" />
        </Button>
      </Tooltip>
    </div>
  );
}
