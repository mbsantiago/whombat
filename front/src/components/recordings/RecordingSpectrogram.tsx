import { useCallback } from "react";
import { DEFAULT_SPECTROGRAM_PARAMETERS } from "@/api/spectrograms";
import Card from "@/components/Card";
import SpectrogramBar from "@/components/spectrograms/SpectrogramBar";
import SpectrogramControls from "@/components/spectrograms/SpectrogramControls";
import Canvas from "@/components/spectrograms/Canvas";
import Player from "@/components/audio/Player";

import useViewport from "@/hooks/window/useWindow";
import drawOnset from "@/draw/onset";
import drawTimeAxis from "@/draw/timeAxis";
import drawFreqAxis from "@/draw/freqAxis";
import useRecordingAudio from "@/hooks/audio/useRecordingAudio";
import { getInitialViewingWindow } from "@/utils/windows";
import useViewportNavigation from "@/hooks/interactions/useViewportNavigation";
import { scaleTimeToViewport } from "@/utils/geometry";
import type {
  Recording,
  SpectrogramParameters,
  SpectrogramWindow,
} from "@/types";

export default function RecordingSpectrogram({
  recording,
  height = 384,
  parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
}: {
  recording: Recording;
  height?: number;
  parameters?: SpectrogramParameters;
}) {
  const {
    viewport: current,
    bounds,
    centerOn,
    expand,
    shift,
    save,
  } = useViewport({
    initial: getInitialViewingWindow({
      startTime: 0,
      endTime: recording.duration,
      samplerate: recording.samplerate,
      parameters,
    }),
    bounds: {
      time: { min: 0, max: recording.duration },
      freq: { min: 0, max: recording.samplerate / 2 },
    },
  });

  const onTimeUpdate = useCallback(
    (time: number) => {
      const { min, max } = current.time;
      const duration = max - min;
      if (time >= max - 0.1 * duration) {
        centerOn({ time: time + 0.4 * duration });
      } else if (time <= min + 0.1 * duration) {
        centerOn({ time: time - 0.4 * duration });
      }
    },
    [current.time, centerOn],
  );

  const audio = useRecordingAudio({
    recording,
    startTime: bounds.time.min,
    endTime: bounds.time.max,
    onTimeUpdate,
  });

  const drawFn = useCallback(
    (ctx: CanvasRenderingContext2D, viewport: SpectrogramWindow) => {
      const time = scaleTimeToViewport(
        audio.currentTime,
        viewport,
        ctx.canvas.width,
      );
      drawOnset(ctx, time);
      drawTimeAxis(ctx, viewport.time);
      drawFreqAxis(ctx, viewport.freq);
    },
    [audio.currentTime],
  );

  const spectrogramBarProps = useViewportNavigation({
    centerOn,
    expand,
    shift,
    save,
  });

  return (
    <Card>
      <div className="flex flex-row gap-4">
        <SpectrogramControls canDrag={true} canZoom={false} />
        <Player {...audio} />
      </div>
      <Canvas drawFn={drawFn} height={height} viewport={current} />
      <SpectrogramBar
        bounds={bounds}
        viewport={current}
        {...spectrogramBarProps}
      />
    </Card>
  );
}

// export default function RecordingSpectrogram({
//   recording,
//   height = 384,
//   withBar = true,
//   withControls = true,
//   withSettings = true,
//   withPlayer = true,
//   parameters = DEFAULT_SPECTROGRAM_PARAMETERS,
//   onParameterSave,
// }: {
//   recording: Recording;
//   height?: number;
//   withBar?: boolean;
//   withControls?: boolean;
//   withSettings?: boolean;
//   withPlayer?: boolean;
//   parameters?: SpectrogramParameters;
//   onParameterSave?: (params: SpectrogramParameters) => void;
// }) {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const dimensions = canvasRef.current?.getBoundingClientRect() ?? {
//     width: 0,
//     height: 0,
//   };
//
//   // These are the absolute bounds of the spectrogram
//   const bounds = useMemo(
//     () => ({
//       time: { min: 0, max: recording.duration },
//       freq: { min: 0, max: recording.samplerate / 2 },
//     }),
//     [recording.duration, recording.samplerate],
//   );
//
//   // This is the initial viewport of the spectrogram
//   const initial = useMemo(
//     () => ({
//       time: { min: 0, max: Math.min(5, recording.duration) },
//       freq: { min: 0, max: recording.samplerate / 2 },
//     }),
//     [recording.samplerate, recording.duration],
//   );
//
//   const audio = useAudio({
//     recording,
//     endTime: bounds.time.max,
//     startTime: bounds.time.min,
//   });
//
//   const { seek, play } = audio;
//   const handleDoubleClick = useCallback(
//     ({ position }: { position: Position }) => {
//       seek(position.time);
//       play();
//     },
//     [seek, play],
//   );
//
//   const spectrogram = useSpectrogram({
//     dimensions,
//     recording,
//     bounds,
//     initial,
//     parameters,
//     onDoubleClick: handleDoubleClick,
//     enabled: !audio.isPlaying,
//   });
//
//   const { centerOn } = spectrogram;
//   const handleTimeChange = useCallback(
//     (time: number) => centerOn({ time }),
//     [centerOn],
//   );
//
//   const { draw: drawTrackAudio } = useSpectrogramTrackAudio({
//     viewport: spectrogram.viewport,
//     currentTime: audio.currentTime,
//     isPlaying: audio.isPlaying,
//     onTimeChange: handleTimeChange,
//   });
//
//   const {
//     props,
//     draw: drawSpectrogram,
//     isLoading: spectrogramIsLoading,
//   } = spectrogram;
//
//   const draw = useCallback(
//     (ctx: CanvasRenderingContext2D) => {
//       ctx.canvas.style.cursor = "wait";
//       if (spectrogramIsLoading) return;
//       drawSpectrogram(ctx);
//       drawTrackAudio(ctx);
//     },
//     [drawSpectrogram, drawTrackAudio, spectrogramIsLoading],
//   );
//
//   useCanvas({ ref: canvasRef, draw });
//
//   return (
//     <Card>
//       <div className="flex flex-row gap-4">
//         {withControls && (
//           <SpectrogramControls
//             canDrag={spectrogram.canDrag}
//             canZoom={spectrogram.canZoom}
//             onReset={spectrogram.reset}
//             onDrag={spectrogram.enableDrag}
//             onZoom={spectrogram.enableZoom}
//           />
//         )}
//         {withSettings && (
//           <SpectrogramSettings
//             samplerate={recording.samplerate}
//             settings={spectrogram.parameters}
//             onChange={spectrogram.setParameters}
//             onReset={spectrogram.resetParameters}
//             onSave={() => onParameterSave?.(spectrogram.parameters)}
//           />
//         )}
//         {withPlayer && <Player {...audio} />}
//       </div>
//       <div className="overflow-hidden rounded-md" style={{ height }}>
//         <canvas ref={canvasRef} {...props} className="w-full h-full" />
//       </div>
//       {withBar && (
//         <SpectrogramBar
//           bounds={spectrogram.bounds}
//           viewport={spectrogram.viewport}
//           onMove={({ position }) => spectrogram.centerOn(position)}
//           onPress={({ position }) => spectrogram.centerOn(position)}
//         />
//       )}
//     </Card>
//   );
// }
