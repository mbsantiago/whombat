"use client";
import { useCallback } from "react";
import toast from "react-hot-toast";
import useStore from "@/store";

import SoundEventAnnotationExplorer from "@/components/sound_event_annotations/SoundEventAnnotationExplore";

import type { SpectrogramParameters } from "@/types";

export default function Page() {
  const parameters = useStore((state) => state.spectrogramSettings);
  const setParameters = useStore((state) => state.setSpectrogramSettings);

  const onParameterSave = useCallback(
    (parameters: SpectrogramParameters) => {
      toast.success("Spectrogram settings saved.");
      setParameters(parameters);
    },
    [setParameters],
  );
  return (
    <SoundEventAnnotationExplorer
      parameters={parameters}
      onParametersSave={onParameterSave}
    />
  );
}
