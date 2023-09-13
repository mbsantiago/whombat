import { useMemo } from "react";
import Card from "@/components/Card";
import ScrollBar from "@/components/ScrollBar";
import { type Recording } from "@/api/recordings";
import useSpectrogram from "@/hooks/useSpectrogram";

export default function RecordingSpectrogram({
  recording,
}: {
  recording: Recording;
}) {
  // These are the absolute bounds of the spectrogram
  const bounds = useMemo(
    () => ({
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.duration, recording.samplerate],
  );

  const {
    elements: { Spectrogram, SettingsMenu, Player },
    state: { window },
  } = useSpectrogram({
    bounds,
    recording,
  });

  const { window: specWindow, setWindow, shiftWindow } = window;

  return (
    <Card>
      <div className="flex flex-row gap-2">
        {SettingsMenu}
        {Player}
      </div>
      {Spectrogram}
      <ScrollBar
        window={specWindow}
        bounds={bounds}
        setWindow={setWindow}
        shiftWindow={shiftWindow}
      />
    </Card>
  ) ;
}
