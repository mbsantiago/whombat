import SoundEventAnnotationDetails from "@/lib/components/sound_event_annotations/SoundEventAnnotationDetails";
import type { SoundEventAnnotation } from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SoundEventAnnotationDetails> = {
  title: "SoundEventAnnotations/Details",
  component: SoundEventAnnotationDetails,
};

export default meta;

type Story = StoryObj<typeof SoundEventAnnotationDetails>;

const base: SoundEventAnnotation = {
  uuid: "se-annotation-1",
  created_on: new Date(),
  sound_event: {
    created_on: new Date(),
    uuid: "se-1",
    geometry_type: "BoundingBox",
    geometry: {
      type: "BoundingBox",
      coordinates: [1, 6000, 2, 8000],
    },
    features: [
      { name: "duration", value: 1 },
      { name: "low_freq", value: 6000 },
      { name: "high_freq", value: 8000 },
      { name: "bandwidth", value: 2000 },
    ],
  },
};

export const Primary: Story = {
  args: {
    soundEventAnnotation: {
      ...base,
      tags: [
        { key: "animal", value: "bird" },
        { key: "call_type", value: "song" },
      ],
    },
  },
};
