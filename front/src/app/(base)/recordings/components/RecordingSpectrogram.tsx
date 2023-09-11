import { useMemo, useRef } from "react";
import Card from "@/components/Card";
import SpectrogramCanvas from "@/components/SpectrogramCanvas";
import SpectrogramSettings from "@/components/SpectrogramSettings";
import ScrollBar from "@/components/ScrollBar";
import { type Recording } from "@/api/recordings";
import { type SpectrogramParameters } from "@/api/spectrograms";
import { useScratch } from "react-use";
import useMouseWheel from "@/hooks/useMouseWheel";
import useWindowDrag from "@/hooks/useWindowDrag";
import useWindowScroll from "@/hooks/useWindowScroll";
import useWindow from "@/hooks/useWindow";

export default function RecordingSpectrogram({
  recording,
  settings,
  onSettingsChange,
  onSettingsClear,
}: {
  recording: Recording;
  settings: SpectrogramParameters;
  onSettingsChange: (key: keyof SpectrogramParameters, value: any) => void;
  onSettingsClear: (key: keyof SpectrogramParameters) => void;
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
      time: { min: 0, max: 5 },
      freq: { min: 0, max: recording.samplerate / 2 },
    }),
    [recording.samplerate],
  );

  // This holds the state for the current viewport of the spectrogram
  const specWindow = useWindow({
    initial,
    bounds,
  });

  const [ref, dragState] = useScratch();

  // This hook allows the user to drag the spectrogram around
  useWindowDrag({
    window: specWindow.window,
    setWindow: specWindow.setWindow,
    active: true,
    dragState,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollState = useMouseWheel(scrollRef);

  // This hook allows the user to move the spectrogram around with the mouse
  useWindowScroll({
    shiftWindow: specWindow.shiftWindow,
    active: true,
    scrollState,
  });

  return (
    <Card>
      <SpectrogramSettings
        settings={settings}
        onChange={onSettingsChange}
        onClear={onSettingsClear}
      />
      <div ref={scrollRef} className="w-max-fit h-max-fit w-full h-full">
        <div ref={ref} className="select-none w-max-fit h-max-fit w-full h-full rounded-lg overflow-hidden">
          <SpectrogramCanvas
            className="w-full h-96"
            recording={recording}
            parameters={settings}
            window={specWindow.window}
          />
        </div>
      </div>
      <ScrollBar
        window={specWindow.window}
        bounds={bounds}
        setWindow={specWindow.setWindow}
        shiftWindow={specWindow.shiftWindow}
      />
    </Card>
  );
}
