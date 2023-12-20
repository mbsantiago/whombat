import Plot from "react-plotly.js";
import { useState } from "react";
import { useMount } from "react-use";

import useScatterPlot from "@/hooks/useScatterPlot";
import Loading from "@/app/loading";
import AnnotationSpectrogram from "@/components/spectrograms/AnnotationSpectrogram";
import Empty from "@/components/Empty";
import useRecording from "@/hooks/api/useRecording";
import useStore from "@/store";
import { type SoundEventAnnotation } from "@/api/schemas";

function ScatterPlot({
  annotations,
  onSelect,
}: {
  annotations: SoundEventAnnotation[];
  onSelect: (annotation: SoundEventAnnotation) => void;
}) {
  useMount(() => {
    window.dispatchEvent(new Event("resize"));
  });

  const { data, layout, onClick } = useScatterPlot({
    annotations,
    onClick: onSelect,
  });
  return (
    <Plot
      className="overflow-hidden w-full h-96 rounded-lg"
      data={data}
      layout={layout}
      onClick={onClick}
      useResizeHandler={true}
      config={{
        responsive: true,
      }}
    />
  );
}

function Spectrogram({
  annotation,
}: {
  annotation: SoundEventAnnotation | null;
}) {
  const parameters = useStore((state) => state.spectrogramSettings);
  const recording = useRecording({
    recording: annotation?.sound_event.recording,
    enabled: annotation != null,
  });

  if (annotation == null) {
    return (
      <Empty>
        <p>Select a sound event to view its spectrogram.</p>
      </Empty>
    );
  }

  if (recording.query.isLoading || recording.query.data == null) {
    return <Loading />;
  }

  return (
    <AnnotationSpectrogram
      className="h-96"
      controls={false}
      parameters={parameters}
      recording={recording.query.data}
      annotation={annotation}
    />
  );
}

export default function AnnotationsScatterPlot({
  annotations,
}: {
  annotations: SoundEventAnnotation[];
}) {
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<SoundEventAnnotation | null>(null);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div>
        <ScatterPlot
          onSelect={setSelectedAnnotation}
          annotations={annotations}
        />
      </div>
      <div>
        <Spectrogram annotation={selectedAnnotation} />
      </div>
    </div>
  );
}
