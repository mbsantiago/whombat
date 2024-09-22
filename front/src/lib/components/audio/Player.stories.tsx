import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Player from "@/lib/components/audio/Player";

const meta: Meta<typeof Player> = {
  title: "Audio/Player",
  component: Player,
  args: {
    onPlay: fn(),
    onPause: fn(),
    onSeek: fn(),
    onChangeSpeed: fn(),
    onToggleLoop: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Player>;

export const Primary: Story = {
  args: {
    currentTime: 1,
    startTime: 1,
    endTime: 2,
    isPlaying: false,
    loop: false,
    speed: 1,
    speedOptions: [
      { label: "0.5x", value: 0.5 },
      { label: "1x", value: 1 },
      { label: "2x", value: 2 },
      { label: "4x", value: 4 },
    ],
  },
};

export const Playing: Story = {
  args: {
    currentTime: 1,
    startTime: 1,
    endTime: 2,
    isPlaying: true,
    loop: false,
    speed: 1,

    speedOptions: [
      {
        label: "0.5x",
        value: 0.5,
      },
      {
        label: "1x",
        value: 1,
      },
      {
        label: "2x",
        value: 2,
      },
      {
        label: "4x",
        value: 4,
      },
    ],
  },
};

export const WithLoop: Story = {
  args: {
    currentTime: 1,
    startTime: 1,
    endTime: 2,
    isPlaying: true,
    loop: true,
    speed: 1,

    speedOptions: [
      {
        label: "0.5x",
        value: 0.5,
      },
      {
        label: "1x",
        value: 1,
      },
      {
        label: "2x",
        value: 2,
      },
      {
        label: "4x",
        value: 4,
      },
    ],
  },
};

export const Midway: Story = {
  args: {
    currentTime: 1.25,
    startTime: 0,
    endTime: 2,
    isPlaying: true,
    loop: true,
    speed: 1,

    speedOptions: [
      {
        label: "0.5x",
        value: 0.5,
      },
      {
        label: "1x",
        value: 1,
      },
      {
        label: "2x",
        value: 2,
      },
      {
        label: "4x",
        value: 4,
      },
    ],
  },
};
