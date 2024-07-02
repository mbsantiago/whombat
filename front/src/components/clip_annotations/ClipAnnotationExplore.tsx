import clipAnnotationFilterDef from "@/components/filters/clip_annotations";
import AnnotationGallery from "@/components/clip_annotations/ClipAnnotationGallery";
import { GalleryIcon } from "@/components/icons";
import ExplorationLayout from "@/components/layouts/Exploration";

import type { ClipAnnotationFilter } from "@/lib/api/clip_annotations";
import type { SpectrogramParameters } from "@/types";

const tabs = [
  {
    id: "gallery",
    title: "Gallery",
    icon: <GalleryIcon className="w-5 h-5" />,
  },
];

export default function ClipAnnotationExplorer(props: {
  filter?: ClipAnnotationFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  return (
    <ExplorationLayout
      description="Explore all annotated clips. Use the filtering options to select a subset, and choose the view you wish to use to explore the clips."
      filter={props.filter}
      filterDef={clipAnnotationFilterDef}
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
        ) : null
      }
    </ExplorationLayout>
  );
}
