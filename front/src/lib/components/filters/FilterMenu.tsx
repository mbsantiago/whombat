import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { type ReactNode, useState } from "react";

import type { Mode } from "@/lib/components/common";
import type { SetFilter } from "@/lib/components/filters/Filters";
import { BackIcon, FilterIcon } from "@/lib/components/icons";
import SearchMenu from "@/lib/components/search/SearchMenu";
import Button, { getButtonClassName } from "@/lib/components/ui/Button";

export type FilterDef<T extends object> = {
  field: keyof T;
  name: string;
  description?: string;
  icon?: ReactNode;
  selector: ({ setFilter }: { setFilter: SetFilter<T> }) => ReactNode;
  render: (renderProps: { value: any; clear: () => void }) => ReactNode;
};

function FilterCombobox<T extends object>({
  filterDefs,
  onChange,
}: {
  filterDefs: FilterDef<T>[];
  onChange?: (filter: FilterDef<T>) => void;
}) {
  return (
    <>
      <div className="mb-2 text-stone-700 underline decoration-amber-500 decoration-2 underline-offset-2 dark:text-stone-300">
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

function FilterPanel<T extends object>({
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
      <div className="mb-2 flex flex-row items-center justify-between">
        <div>
          <span className="mr-2 text-stone-500">Filter by</span>
          <span className="text-stone-700 underline decoration-amber-500 decoration-2 underline-offset-2 dark:text-stone-300">
            {selectedFilter.name}
          </span>
        </div>
        <Button
          mode="text"
          variant="warning"
          onClick={() => setSelectedFilter(null)}
        >
          <BackIcon className="h-5 w-5 group-hover:stroke-3" />
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

export default function FilterPopover<T extends object>({
  filterDef,
  button,
  mode = "filled",
  variant = "primary",
  className,
  onSetFilterField,
}: {
  filterDef: FilterDef<T>[];
  button?: ReactNode;
  mode?: Mode;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  className?: string;
  onSetFilterField?: <K extends keyof T>(field: K, value: T[K]) => void;
}) {
  if (className == null) {
    className = getButtonClassName({ mode, variant });
  }

  return (
    <Popover as="div" className="relative inline-block text-left">
      <PopoverButton className={className}>
        {button != null ? button : <FilterIcon className="h-4 w-4 stroke-2" />}
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: "bottom start", gap: 4 }}
        transition
        unmount
        className="ring-opacity-5 z-50 w-96 divide-y divide-stone-100 rounded-md border border-stone-200 bg-stone-50 shadow-md ring-1 ring-stone-900 transition duration-100 ease-out focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 dark:border-stone-500 dark:bg-stone-700 dark:shadow-stone-800"
      >
        <div className="p-4">
          <FilterPanel
            onSetFilterField={onSetFilterField}
            filterDefs={filterDef}
          />
        </div>
      </PopoverPanel>
    </Popover>
  );
}
