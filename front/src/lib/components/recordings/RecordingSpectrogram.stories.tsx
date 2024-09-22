import type { Meta, StoryObj } from "@storybook/react";

import Player from "@/lib/components/audio/Player";
import RecordingSpectrogram from "@/lib/components/recordings/RecordingSpectrogram";
import SettingsMenu from "@/lib/components/settings/SettingsMenu";
import Canvas from "@/lib/components/spectrograms/Canvas";
import ViewportBar from "@/lib/components/spectrograms/ViewportBar";
import ViewportToolbar from "@/lib/components/spectrograms/ViewportToolbar";

import {
  DEFAULT_AUDIO_SETTINGS,
  DEFAULT_SPECTROGRAM_SETTINGS,
} from "@/lib/constants";
import type { SpectrogramWindow } from "@/lib/types";

const meta: Meta<typeof RecordingSpectrogram> = {
  title: "Recordings/Spectrogram",
  component: RecordingSpectrogram,
  parameters: {
    controls: {
      exclude: [
        "Canvas",
        "Player",
        "ViewportBar",
        "ViewportToolbar",
        "SettingsMenu",
      ],
    },
  },
};

export default meta;

type Story = StoryObj<typeof RecordingSpectrogram>;

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
    Player: (
      <Player
        currentTime={0}
        startTime={0}
        endTime={1}
        speedOptions={[{ label: "1x", value: 1 }]}
      />
    ),
    SettingsMenu: (
      <SettingsMenu
        audioSettings={DEFAULT_AUDIO_SETTINGS}
        spectrogramSettings={DEFAULT_SPECTROGRAM_SETTINGS}
        samplerate={samplerate}
      />
    ),
    Canvas: <Canvas viewport={viewport} height={400} />,
    ViewportBar: <ViewportBar viewport={viewport} bounds={bounds} />,
  },
};
