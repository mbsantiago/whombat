import dynamic from "next/dynamic";
import { useState } from "react";

import FilterBar from "@/components/filters/FilterBar";
import FilterMenu from "@/components/filters/FilterMenu";
import AnnotationGallery from "@/components/sound_event_annotations/SoundEventAnnotationsGallery";
import { FilterIcon, GalleryIcon, PlotIcon } from "@/components/icons";
import Tabs from "@/components/Tabs";
import soundEventAnnotationFilterDef from "@/components/filters/sound_event_annotations";
import useFilter from "@/hooks/utils/useFilter";

import type { Filter } from "@/hooks/utils/useFilter";
import type { SoundEventAnnotationFilter } from "@/api/sound_event_annotations";
import type { SpectrogramParameters } from "@/types";

const AnnotationsScatterPlot = dynamic(
  () =>
    import(
      "@/components/sound_event_annotations/SoundEventAnnotationsScatterPlot"
    ),
  {
    ssr: false,
  },
);

const noFilter: SoundEventAnnotationFilter = {};

export default function SoundEventAnnotationExplorer(props: {
  filter?: SoundEventAnnotationFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  const [view, setView] = useState("list");

  const filter = useFilter<SoundEventAnnotationFilter>({
    defaults: props.filter || noFilter,
  });

  return (
    <div className="flex flex-col gap-2 p-2">
      <div>
        <div className="flex flex-row justify-center">
          <p className="text-stone-500 text-sm max-w-prose text-center">
            Explore all annotated sound events. Use the filtering options to
            select a subset, and choose the view you wish to use to explore the
            sound events.
          </p>
        </div>
        <FilterControls filter={filter} />
      </div>
      <div className="flex flex-row gap-2 justify-center w-full">
        <Tabs
          tabs={[
            {
              id: "gallery",
              title: "Gallery",
              isActive: view === "gallery",
              icon: <GalleryIcon className="w-5 h-5" />,
              onClick: () => setView("gallery"),
            },
            {
              id: "plot",
              title: "Scatterplot",
              isActive: view === "plot",
              icon: <PlotIcon className="w-5 h-5" />,
              onClick: () => setView("plot"),
            },
          ]}
        />
      </div>
      <div className="p-4">
        {view === "gallery" ? (
          <AnnotationGallery
            filter={filter.filter}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        ) : (
          <AnnotationsScatterPlot
            filter={filter.filter}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        )}
      </div>
    </div>
  );
}

function FilterControls({
  filter,
}: {
  filter: Filter<SoundEventAnnotationFilter>;
}) {
  return (
    <div className="flex flex-row items-center gap-2 px-2">
      <FilterMenu
        mode="text"
        filter={filter}
        filterDef={soundEventAnnotationFilterDef}
        button={
          <>
            Add filters <FilterIcon className="inline-block w-4 h-4 stroke-2" />
          </>
        }
      />
      <FilterBar
        filter={filter}
        filterDef={soundEventAnnotationFilterDef}
        showIfEmpty
        withLabel={false}
      />
    </div>
  );
}
