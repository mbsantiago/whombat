import { Float } from "@headlessui-float/react";
import { Popover } from "@headlessui/react";
import { type ReactNode, useState } from "react";

import type { SetFilter } from "@/lib/components/filters/Filters";
import { BackIcon, FilterIcon } from "@/lib/components/icons";
import SearchMenu from "@/lib/components/search/SearchMenu";
import Button, { getButtonClassName } from "@/lib/components/ui/Button";

export type FilterDef<T extends Object> = {
  field: keyof T;
  name: string;
  description?: string;
  icon?: ReactNode;
  selector: ({ setFilter }: { setFilter: SetFilter<T> }) => ReactNode;
  render: (renderProps: { value: any; clear: () => void }) => ReactNode;
};

function FilterCombobox<T extends Object>({
  filterDefs,
  onChange,
}: {
  filterDefs: FilterDef<T>[];
  onChange?: (filter: FilterDef<T>) => void;
}) {
  return (
    <>
      <div className="mb-2 underline text-stone-700 underline-offset-2 decoration-amber-500 decoration-2 dark:text-stone-300">
        Apply Filter
      </div>
      <SearchMenu
        options={filterDefs}
        static={false}
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
        empty={
          <div className="w-full text-center text-stone-500">
            No filters found
          </div>
        }
        autoFocus
      />
    </>
  );
}

function FilterPanel<T extends Object>({
  filterDefs,
  onSetFilterField,
}: {
  filterDefs: FilterDef<T>[];
  onSetFilterField?: <K extends keyof T>(name: K, value: T[K]) => void;
}) {
  const [selectedFilter, setSelectedFilter] = useState<FilterDef<T> | null>(
    null,
  );

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
      <div className="flex flex-row justify-between items-center mb-2">
        <div>
          <span className="mr-2 text-stone-500">Filter by</span>
          <span className="underline text-stone-700 underline-offset-2 decoration-amber-500 decoration-2 dark:text-stone-300">
            {selectedFilter.name}
          </span>
        </div>
        <Button
          mode="text"
          variant="warning"
          onClick={() => setSelectedFilter(null)}
        >
          <BackIcon className="w-5 h-5 group-hover:stroke-3" />
        </Button>
      </div>
      {selectedFilter.description != null ? (
        <div className="mb-4">
          <span className="text-sm text-stone-600 dark:text-stone-400">
            {selectedFilter.description}
          </span>
        </div>
      ) : null}
      <div className="flex flex-row space-x-2">
        {selectedFilter.selector({
          setFilter: (name, value) => {
            onSetFilterField?.(name, value);
            setSelectedFilter(null);
          },
        })}
      </div>
    </>
  );
}

export default function FilterPopover<T extends Object>({
  filterDef,
  button,
  mode = "filled",
  variant = "primary",
  className,
  onSetFilterField,
}: {
  filterDef: FilterDef<T>[];
  button?: ReactNode;
  mode?: "filled" | "outline" | "text";
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  className?: string;
  onSetFilterField?: <K extends keyof T>(field: K, value: T[K]) => void;
}) {
  if (className == null) {
    className = getButtonClassName({ mode, variant });
  }

  return (
    <Popover as="div" className="inline-block relative text-left">
      <Float
        autoPlacement
        portal={true}
        offset={4}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Popover.Button className={className}>
          {button != null ? (
            button
          ) : (
            <FilterIcon className="w-4 h-4 stroke-2" />
          )}
        </Popover.Button>
        <Popover.Panel
          unmount
          className="z-50 w-96 rounded-md border divide-y ring-1 ring-opacity-5 shadow-md focus:outline-none divide-stone-100 bg-stone-50 border-stone-200 ring-stone-900 dark:bg-stone-700 dark:border-stone-500 dark:shadow-stone-800"
        >
          <div className="p-4">
            <FilterPanel
              onSetFilterField={onSetFilterField}
              filterDefs={filterDef}
            />
          </div>
        </Popover.Panel>
      </Float>
    </Popover>
  );
}
