import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import SoundEventAnnotationsScatterPlot from "@/lib/components/sound_event_annotations/SoundEventAnnotationsScatterPlot";

import type { ScatterPlotData, Tag } from "@/lib/types";

const meta: Meta<typeof SoundEventAnnotationsScatterPlot> = {
  title: "SoundEventAnnotations/ScatterPlot",
  component: SoundEventAnnotationsScatterPlot,
  args: {
    onClickSoundEvent: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof SoundEventAnnotationsScatterPlot>;

const speciesTags: Tag[] = [
  { key: "Species", value: "Cat" },
  { key: "Species", value: "Dog" },
  { key: "Species", value: "Bird" },
  { key: "Species", value: "Human" },
  { key: "Species", value: "Elephant" },
  { key: "Species", value: "Lion" },
];

const behaviourTags: Tag[] = [
  { key: "Behaviour", value: "Barking" },
  { key: "Behaviour", value: "Meowing" },
  { key: "Behaviour", value: "Roaring" },
  { key: "Behaviour", value: "Singing" },
  { key: "Behaviour", value: "Trumpeting" },
  { key: "Behaviour", value: "Howling" },
];

const qualityTags: Tag[] = [
  { key: "Quality", value: "Good" },
  { key: "Quality", value: "Bad" },
  { key: "Quality", value: "Meh" },
];

const locationTags: Tag[] = [
  { key: "Location", value: "Forest" },
  { key: "Location", value: "City" },
  { key: "Location", value: "Beach" },
  { key: "Location", value: "Desert" },
  { key: "Location", value: "Mountain" },
];

const timeOfDateTags: Tag[] = [
  { key: "Time of Day", value: "Morning" },
  { key: "Time of Day", value: "Afternoon" },
  { key: "Time of Day", value: "Evening" },
  { key: "Time of Day", value: "Night" },
];

function randomFeatures() {
  return [
    { name: "low_freq", value: Math.random() },
    { name: "high_freq", value: Math.random() },
    { name: "duration", value: Math.random() },
    { name: "snr", value: Math.random() },
  ];
}

function randomSoundEventTags() {
  const tags = [];

  if (Math.random() < 0.5) {
    tags.push(speciesTags[Math.floor(Math.random() * speciesTags.length)]);
  }

  if (Math.random() < 0.5) {
    tags.push(behaviourTags[Math.floor(Math.random() * behaviourTags.length)]);
  }

  if (Math.random() < 0.5) {
    tags.push(qualityTags[Math.floor(Math.random() * qualityTags.length)]);
  }
  return tags;
}

function randomRecordingTags() {
  const tags = [];

  if (Math.random() < 0.5) {
    tags.push(locationTags[Math.floor(Math.random() * locationTags.length)]);
  }

  if (Math.random() < 0.5) {
    tags.push(
      timeOfDateTags[Math.floor(Math.random() * timeOfDateTags.length)],
    );
  }

  return tags;
}

const data: ScatterPlotData[] = Array.from({ length: 100 }, (_, index) => ({
  uuid: index.toString(),
  features: randomFeatures(),
  tags: randomSoundEventTags(),
  recording_tags: randomRecordingTags(),
}));

export const Empty: Story = {
  args: { data: [] },
};

export const SinglePoint: Story = {
  args: { data: data.slice(0, 1) },
};

export const ManyPoints: Story = {
  args: { data: data },
};
