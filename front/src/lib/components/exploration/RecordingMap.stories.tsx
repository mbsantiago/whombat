import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import type { Recording, Tag } from "@/lib/types";

import RecordingMap from "./RecordingMap";

const meta: Meta<typeof RecordingMap> = {
  title: "Exploration/RecordingMap",
  component: RecordingMap,
};

export default meta;

type Story = StoryObj<typeof RecordingMap>;

function randomPosition() {
  return {
    latitude: 51.5072 + (2 * Math.random() - 1) * 0.2,
    longitude: -0.1276 + (2 * Math.random() - 1) * 0.2,
  };
}

const speciesTags: Tag[] = [
  { key: "species", value: "Blue Whale" },
  { key: "species", value: "Humpback Whale" },
  { key: "species", value: "Fin Whale" },
  { key: "species", value: "Killer Whale" },
];

const locationTags: Tag[] = [
  { key: "location", value: "Pacific Ocean" },
  { key: "location", value: "Atlantic Ocean" },
  { key: "location", value: "Indian Ocean" },
];

function getRandomTags(): Tag[] {
  let tags = [];

  if (Math.random() < 0.5) {
    let speciesTag =
      speciesTags[Math.floor(Math.random() * speciesTags.length)];
    tags.push(speciesTag);
  }

  if (Math.random() < 0.5) {
    let locationTag =
      locationTags[Math.floor(Math.random() * locationTags.length)];
    tags.push(locationTag);
  }

  return tags;
}

const recordings: Recording[] = Array(200)
  .fill(null)
  .map((_, index) => ({
    uuid: `recording-${index}`,
    path: `recording-${index}.wav`,
    hash: `hash-${index}`,
    duration: 60,
    channels: 1,
    samplerate: 44100,
    time_expansion: 1,
    created_on: new Date(),
    tags: getRandomTags(),
    ...randomPosition(),
  }));

export const NoColor: Story = {
  args: {
    recordings: recordings.slice(0, 10),
    onClickRecording: fn(),
  },
};

export const ColorBy: Story = {
  args: {
    recordings: recordings.slice(0, 50),
    onClickRecording: fn(),
    colorBy: "species",
  },
};
