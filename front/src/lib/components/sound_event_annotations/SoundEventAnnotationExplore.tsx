import dynamic from "next/dynamic";

import soundEventAnnotationFilterDef from "@/components/filters/sound_event_annotations";
import AnnotationGallery from "@/components/sound_event_annotations/SoundEventAnnotationsGallery";
import { GalleryIcon, PlotIcon } from "@/components/icons";
import ExplorationLayout from "@/components/layouts/Exploration";

import type { SoundEventAnnotationFilter } from "@/lib/api/sound_event_annotations";
import type { SpectrogramParameters } from "@/lib/types";

const AnnotationsScatterPlot = dynamic(
  () =>
    import(
      "@/components/sound_event_annotations/SoundEventAnnotationsScatterPlot"
    ),
  {
    ssr: false,
  },
);

const tabs = [
  {
    id: "gallery",
    title: "Gallery",
    icon: <GalleryIcon className="w-5 h-5" />,
  },
  {
    id: "plot",
    title: "Scatterplot",
    icon: <PlotIcon className="w-5 h-5" />,
  },
];

export default function SoundEventAnnotationExplorer(props: {
  filter?: SoundEventAnnotationFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  return (
    <ExplorationLayout
      description="Explore all annotated sound events. Use the filtering options to select a subset, and choose the view you wish to use to explore the sound events."
      filter={props.filter}
      filterDef={soundEventAnnotationFilterDef}
      parameters={props.parameters}
      onParametersSave={props.onParametersSave}
      tabs={tabs}
    >
      {({ view, filter }) =>
        view === "gallery" ? (
          <AnnotationGallery
            filter={filter}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        ) : (
          <AnnotationsScatterPlot
            filter={filter}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        )
      }
    </ExplorationLayout>
  );
}
