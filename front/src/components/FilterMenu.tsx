import { type ReactNode, useState } from "react";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";

import { BackIcon, FilterIcon } from "@/components/icons";
import { type SetFilter } from "@/components/Filters";
import { type Filter } from "@/hooks/api/useFilter";
import SearchMenu from "@/components/SearchMenu";
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
  return (
    <>
      <div className="mb-2 text-stone-700 dark:text-stone-300 underline underline-offset-2 decoration-amber-500 decoration-2">
        Apply Filter
      </div>
      <SearchMenu
        options={filterDefs}
        renderOption={(filter) => (
          <>
            {filter.icon ?? filter.icon}
            {filter.name}
          </>
        )}
        limit={5}
        fields={["name", "prefix"]}
        getOptionKey={(filter) => filter.name}
        onSelect={onChange}
        autoFocus
      />
    </>
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
  button,
}: {
  filter: Filter<T>;
  filterDefs: FilterDef[];
  button?: ReactNode;
}) {
  return (
    <Popover as="div" className="relative inline-block text-left">
      <div>
        <Popover.Button as={Button}>
          {button != null ? (
            button
          ) : (
            <FilterIcon className="h-4 w-4 stroke-2 text-emerald-900" />
          )}
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
