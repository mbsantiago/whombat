import { useState, useMemo } from "react";

import FilterBar from "@/components/filters/FilterBar";
import FilterMenu from "@/components/filters/FilterMenu";
import { FilterIcon } from "@/components/icons";
import Tabs from "@/components/Tabs";
import useFilter from "@/hooks/utils/useFilter";

import type { ReactNode } from "react";
import type { FilterDef } from "@/components/filters/FilterMenu";
import type { Filter } from "@/hooks/utils/useFilter";
import type { SpectrogramParameters } from "@/types";

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
          <p className="text-stone-500 text-sm max-w-prose text-center">
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
    <div className="flex flex-row items-center gap-2 px-2">
      <FilterMenu
        mode="text"
        filter={filter}
        filterDef={filterDef}
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
      <FilterBar
        filter={filter}
        filterDef={filterDef}
        showIfEmpty
        withLabel={false}
      />
    </div>
  );
}
