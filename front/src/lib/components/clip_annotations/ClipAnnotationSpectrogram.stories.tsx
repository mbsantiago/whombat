import type { Meta, StoryObj } from "@storybook/react";

import ClipAnnotationSpectrogram from "@/lib/components/clip_annotations/ClipAnnotationSpectrogram";

import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SPECTROGRAM_SETTINGS,
} from "@/lib/constants";
import type { SpectrogramWindow } from "@/lib/types";

import AnnotationControls from "../annotation/AnnotationControls";
import Player from "../audio/Player";
import SettingsMenu from "../settings/SettingsMenu";
import Canvas from "../spectrograms/Canvas";
import ViewportBar from "../spectrograms/ViewportBar";
import ViewportToolbar from "../spectrograms/ViewportToolbar";

const meta: Meta<typeof ClipAnnotationSpectrogram> = {
  title: "ClipAnnotation/ClipAnnotationSpectrogram",
  component: ClipAnnotationSpectrogram,
  parameters: {
    controls: {
      exclude: [
        "Canvas",
        "ViewportBar",
        "ViewportToolbar",
        "Player",
        "SettingsMenu",
        "AnnotationControls",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof ClipAnnotationSpectrogram>;

const samplerate = 44100;
const viewport: SpectrogramWindow = {
  time: { min: 0, max: 1 },
  freq: { min: 0, max: samplerate / 2 },
};

const bounds: SpectrogramWindow = {
  time: { min: 0, max: 10 },
  freq: { min: 0, max: samplerate / 2 },
};

export const Primary: Story = {
  args: {
    ViewportToolbar: <ViewportToolbar mode="panning" />,
    AnnotationControls: (
      <AnnotationControls mode="idle" geometryType="BoundingBox" />
    ),
    Player: (
      <Player
        currentTime={0}
        endTime={10}
        speedOptions={[{ value: 1, label: "1x" }]}
      />
    ),
    SettingsMenu: (
      <SettingsMenu
        audioSettings={DEFAULT_AUDIO_SETTINGS}
        spectrogramSettings={DEFAULT_SPECTROGRAM_SETTINGS}
        samplerate={samplerate}
      />
    ),
    ViewportBar: <ViewportBar viewport={viewport} bounds={bounds} />,
    Canvas: <Canvas viewport={viewport} height={400} />,
  },
};
