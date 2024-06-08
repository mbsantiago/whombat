import { useRef } from "react";

import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import Player from "@/components/audio/Player";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import SpectrogramSettings from "@/components/spectrograms/SpectrogramSettings";
import useAudio from "@/hooks/audio/useAudio";
import useCanvas from "@/hooks/draw/useCanvas";
import useSpectrogram from "@/hooks/spectrogram/useSpectrogram";
import useSpectrogramTrackAudio from "@/hooks/spectrogram/useSpectrogramTrackAudio";

import type { Recording, SpectrogramWindow } from "@/types";

export default function Spectrogram({
  drawFn,
  viewport,
}: {
  drawFn: (ctx: CanvasRenderingContext2D) => void;
  viewport: SpectrogramWindow;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div className="overflow-hidden rounded-md" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
