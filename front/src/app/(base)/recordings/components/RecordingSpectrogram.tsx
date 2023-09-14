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

  // This is the initial viewport of the spectrogram
  const initial = useMemo(
    () => ({
      time: { min: 0, max: Math.min(5, recording.duration) },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.samplerate, recording.duration],
  );

  const {
    elements: { SpectrogramControls, Spectrogram, SettingsMenu, Player },
    state: { window },
    controls: {
      window: {
        set: setWindow,
        shift: shiftWindow,
      }
    }
  } = useSpectrogram({
    bounds,
    initial,
    recording,
    canDrag: true,
    canBBoxZoom: false,
  });

  return (
    <Card>
      <div className="flex flex-row gap-2">
        {SpectrogramControls}
        {SettingsMenu}
        {Player}
      </div>
      <div className="h-96">{Spectrogram}</div>
      <ScrollBar
        window={window}
        bounds={bounds}
        setWindow={setWindow}
        shiftWindow={shiftWindow}
      />
    </Card>
  );
}
