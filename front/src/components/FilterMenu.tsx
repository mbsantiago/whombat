import { useMemo, useState, type ReactNode } from "react";
import { Popover, Transition, Combobox } from "@headlessui/react";
import { Fragment } from "react";
import { FilterIcon, BackIcon } from "@/components/icons";
import { type SetFilter } from "@/components/Filters";
import { type Filter } from "@/hooks/useFilter";
import Fuse from "fuse.js";
import Search from "@/components/Search";
import Button from "@/components/Button";

export type FilterDef = {
  icon?: ReactNode;
  name: string;
  selector: ({ setFilter }: { setFilter: SetFilter }) => ReactNode;
  description?: string;
  prefix?: string;
};

function FilterCombobox({
  filterDefs,
  onChange,
}: {
  filterDefs: FilterDef[];
  onChange?: (filter: FilterDef) => void;
}) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(filterDefs, {
        keys: ["name", "prefix"],
        threshold: 0.3,
      }),
    [filterDefs],
  );

  const filteredFilters = useMemo(() => {
    if (!query) return filterDefs.slice(5);
    return fuse.search(query, { limit: 5 }).map((result) => result.item);
  }, [query, fuse, filterDefs]);

  return (
    <Combobox onChange={onChange}>
      <div className="mb-2 text-stone-700 dark:text-stone-300 underline underline-offset-2 decoration-amber-500 decoration-2">
        Apply Filter
      </div>
      <Combobox.Input
        as={Search}
        autoFocus
        withButton={false}
        // @ts-ignore
        onChange={(value) => setQuery(value)}
      />
      <Combobox.Options static className="pt-4">
        {filteredFilters.map((filter) => (
          <Combobox.Option
            className={({ active }) =>
              `relative cursor-default select-none p-2 rounded-md ${
                active ? "bg-stone-200 dark:bg-stone-800 text-emerald-600 dark:text-emerald-500" : ""
              }`
            }
            key={filter.name}
            value={filter}
          >
            {filter.icon ?? filter.icon}
            {filter.name}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  );
}

function FilterPanel<T extends Object>({
  filter,
  filterDefs,
}: {
  filter: Filter<T>;
  filterDefs: FilterDef[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<FilterDef | null>(null);

  if (selectedFilter == null) {
    return (
      <FilterCombobox
        filterDefs={filterDefs}
        onChange={(filter) => setSelectedFilter(filter)}
      />
    );
  }

  return (
    <>
      <div className="mb-2 flex flex-row items-center justify-between">
        <div>
          <span className="text-stone-500 mr-2">Filter by</span>
          <span className="text-stone-700 dark:text-stone-300 underline underline-offset-2 decoration-amber-500 decoration-2">
            {selectedFilter.name}
          </span>
        </div>
        <Button
          mode="text"
          variant="warning"
          onClick={() => setSelectedFilter(null)}
        >
          <BackIcon className="w-5 h-5" />
        </Button>
      </div>
      {selectedFilter.description != null ? (
        <div className="mb-4">
          <span className="text-sm dark:text-stone-400 text-stone-600">
            {selectedFilter.description}
          </span>
        </div>
      ) : null}
      <div className="flex flex-row space-x-2">
        {selectedFilter.selector({
          setFilter: ({ name, value }) => {
            filter.set(name as keyof T, value as any);
            setSelectedFilter(null);
          },
        })}
      </div>
    </>
  );
}

export default function FilterPopover<T extends Object>({
  filter,
  filterDefs,
}: {
  filter: Filter<T>;
  filterDefs: FilterDef[];
}) {
  return (
    <Popover as="div" className="relative inline-block text-left">
      <div>
        <Popover.Button as={Button}>
          <FilterIcon className="h-4 w-4 stroke-2 text-emerald-900" />
        </Popover.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Panel
          unmount
          className="absolute right-0 mt-2 w-96 origin-top-right divide-y divide-stone-100 rounded-md bg-stone-50 dark:bg-stone-700 border border-stone-200 dark:border-stone-500 shadow-md dark:shadow-stone-800 ring-1 ring-stone-900 ring-opacity-5 focus:outline-none z-50"
        >
          <div className="p-4">
            <FilterPanel filter={filter} filterDefs={filterDefs} />
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
}
