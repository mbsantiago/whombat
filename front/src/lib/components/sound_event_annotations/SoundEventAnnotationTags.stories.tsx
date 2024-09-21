import SoundEventAnnotationTags from "@/lib/components/sound_event_annotations/SoundEventAnnotationTags";
import type { SoundEventAnnotation } from "@/lib/types";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SoundEventAnnotationTags> = {
  title: "SoundEventAnnotations/Tags",
  component: SoundEventAnnotationTags,
};

export default meta;

type Story = StoryObj<typeof SoundEventAnnotationTags>;

const base: SoundEventAnnotation = {
  uuid: "se-annotation-1",
  created_on: new Date(),
  sound_event: {
    created_on: new Date(),
    uuid: "se-1",
    geometry_type: "TimeStamp",
    geometry: {
      type: "TimeStamp",
      coordinates: 0.5,
    },
  },
};

export const Empty: Story = {
  args: { soundEventAnnotation: base },
};

export const WithTags: Story = {
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
