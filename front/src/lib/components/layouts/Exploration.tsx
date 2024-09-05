import { useState, useMemo } from "react";

import FilterBar from "@/lib/components/filters/FilterBar";
import FilterMenu from "@/lib/components/filters/FilterMenu";
import { FilterIcon } from "@/lib/components/icons";
import Tabs from "@/lib/components/navigation/SectionTabs";
import useFilter from "@/lib/hooks/utils/useFilter";

import type { ReactNode } from "react";
import type { FilterDef } from "@/lib/components/filters/FilterMenu";
import type { Filter } from "@/lib/hooks/utils/useFilter";
import type { SpectrogramParameters } from "@/lib/types";

type Tab = {
  id: string;
  title: string;
  icon?: JSX.Element;
};

const _empty = {};

export default function ExplorationLayout<T extends Object>(props: {
  description: string;
  filter?: T;
  filterDef: FilterDef<T>[];
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
  children: (props: { view: string; filter: T }) => ReactNode;
  tabs: Tab[];
}) {
  const [view, setView] = useState(props.tabs[0].id);

  const filter = useFilter<T>({
    // @ts-ignore
    defaults: props.filter || _empty,
  });

  const tabs = useMemo(
    () =>
      props.tabs.map((tab) => ({
        ...tab,
        isActive: tab.id === view,
        onClick: () => setView(tab.id),
      })),
    [props.tabs, view],
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <div>
        <div className="flex flex-row justify-center">
          <p className="max-w-prose text-sm text-center text-stone-500">
            {props.description}
          </p>
        </div>
        <FilterControls filter={filter} filterDef={props.filterDef} />
      </div>
      <div className="flex flex-row gap-2 justify-center w-full">
        <Tabs tabs={tabs} />
      </div>
      <div className="p-4">
        {props.children({ view, filter: filter.filter })}
      </div>
    </div>
  );
}

function FilterControls<T extends Object>({
  filter,
  filterDef,
}: {
  filter: Filter<T>;
  filterDef: FilterDef<T>[];
}) {
  return (
    <div className="flex flex-row gap-2 items-center px-2">
      <FilterMenu
        mode="text"
        onSetFilterField={filter.set}
        filterDef={filterDef}
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
      <FilterBar
        filter={filter.filter}
        onClearFilterField={filter.clear}
        fixedFilterFields={filter.fixed}
        filterDef={filterDef}
        showIfEmpty
        withLabel={false}
      />
    </div>
  );
}
