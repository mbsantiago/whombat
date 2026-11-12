import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import ViewSettings from "@/lib/components/settings/ViewSettings";

const meta: Meta<typeof ViewSettings> = {
  title: "Settings/ViewSettings",
  component: ViewSettings,
  args: {
    samplerate: 44100,
    onChange: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ViewSettings>;

export const Primary: Story = {
  args: {
    settings: {
      duration: 1,
      min_freq: 0,
      max_freq: null,
    },
  },
};
