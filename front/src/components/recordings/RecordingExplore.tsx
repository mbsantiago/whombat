import recordingFilterDef from "@/components/filters/recordings";
import RecordingGallery from "@/components/recordings/RecordingGallery";
import { GalleryIcon } from "@/components/icons";
import ExplorationLayout from "@/components/layouts/Exploration";

import type { RecordingFilter } from "@/api/recordings";
import type { SpectrogramParameters } from "@/types";

const tabs = [
  {
    id: "gallery",
    title: "Gallery",
    icon: <GalleryIcon className="w-5 h-5" />,
  },
];

export default function RecordingExplorer(props: {
  filter?: RecordingFilter;
  parameters?: SpectrogramParameters;
  onParametersSave?: (parameters: SpectrogramParameters) => void;
}) {
  return (
    <ExplorationLayout
      description="Explore all recordings. Use the filtering options to select a subset, and choose the view you wish to use to explore the recordings."
      filter={props.filter}
      filterDef={recordingFilterDef}
      parameters={props.parameters}
      onParametersSave={props.onParametersSave}
      tabs={tabs}
    >
      {({ view, filter }) =>
        view === "gallery" ? (
          <RecordingGallery
            filter={filter}
            parameters={props.parameters}
            onParametersSave={props.onParametersSave}
          />
        ) : null
      }
    </ExplorationLayout>
  );
}
