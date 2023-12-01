import { useState } from "react";

import useStore from "@/store";
import AnnotationSpectrogram from "@/components/spectrograms/AnnotationSpectrogram";
import { type Annotation } from "@/api/annotations";

// TODO: Finish this

export default function AnnotationsGallery({
  annotations,
}: {
  annotations: Annotation[];
}) {
  const parameters = useStore((state) => state.spectrogramSettings);
  const [showMax, setShowMax] = useState(20);

  return (
    <div className="grid grid-cols-6 gap-8 px-4">
      {annotations.slice(0, showMax).map((annotation) => (
        <AnnotationSpectrogram
          controls={false}
          player={false}
          className="h-48"
          parameters={parameters}
          key={annotation.id}
          recording={{
            // TODO: Need to query the annotations with the recording info.
            id: annotation.sound_event.recording_id,
            duration: 1246.2825,
            samplerate: 48000,
            time_expansion: 1,
            channels: 1,
            hash: "",
            uuid: "",
            path: "",
            latitude: null,
            longitude: null,
            date: null,
            time: null,
            features: [],
            notes: [],
            tags: [],
            created_on: new Date(),
          }}
          annotation={annotation}
        />
      ))}
    </div>
  );
}
