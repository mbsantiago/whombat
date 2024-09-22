import type { Meta, StoryObj } from "@storybook/react";

import SelectedSoundEventAnnotation from "@/lib/components/sound_event_annotations/SelectedSoundEventAnnotation";

import type { SoundEventAnnotation } from "@/lib/types";

const meta: Meta<typeof SelectedSoundEventAnnotation> = {
  title: "SoundEventAnnotations/Detail",
  component: SelectedSoundEventAnnotation,
};

export default meta;

const soundEventAnnotation: SoundEventAnnotation = {
  uuid: "se-annotation-1",
  created_on: new Date(),
  sound_event: {
    created_on: new Date(),
    uuid: "se-1",
    geometry_type: "BoundingBox",
    geometry: {
      type: "BoundingBox",
      coordinates: [0, 0, 1, 1],
    },
  },
};

type Story = StoryObj<typeof SelectedSoundEventAnnotation>;

export const Primary: Story = {
  args: {
    soundEventAnnotation,
  },
};
