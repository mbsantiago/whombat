import { useMemo } from "react";

import type { FilterDef } from "@/lib/components/filters/FilterMenu";
import { FilterIcon } from "@/lib/components/icons";

const _emptyFilter = {};

export default function FilterBar<T extends Object>({
  filter = _emptyFilter as T,
  fixedFilterFields,
  filterDef,
  total,
  showIfEmpty = false,
  withLabel = true,
  onClearFilterField,
}: {
  filter?: T;
  filterDef: FilterDef<T>[];
  fixedFilterFields?: (keyof T)[];
  total?: number;
  showIfEmpty?: boolean;
  withLabel?: boolean;
  onClearFilterField?: (key: keyof T) => void;
}) {
  const activeFilters = Object.keys(filter).filter(
    (key) => !(key in (fixedFilterFields || [])),
  ).length;

  const filterDefMapping = useMemo(() => {
    const mapping: Record<string, FilterDef<T>> = {};
    for (const def of filterDef) {
      mapping[def.field as string] = def;
    }
    return mapping;
  }, [filterDef]);

  if (activeFilters === 0 && !showIfEmpty) {
    return null;
  }

  return (
    <div className="flex flex-row items-center">
      {total != null && (
        <span className="mr-3 text-stone-500">{total} results</span>
      )}
      <div className="flex flex-row items-center space-x-2">
        {withLabel && (
          <span className="mr-2 text-blue-200">
            <FilterIcon className="inline-block mr-1 w-5 h-5" />
            filters:
          </span>
        )}
        {Object.entries(filter)
          .filter(([key, _]) => !(key in (fixedFilterFields || [])))
          .filter(([key, _]) => key in filterDefMapping)
          .map(([key, value]) => {
            const filterDef = filterDefMapping[key];
            return (
              <div key={key}>
                {filterDef.render({
                  value,
                  clear: () => onClearFilterField?.(key as keyof T),
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
}
