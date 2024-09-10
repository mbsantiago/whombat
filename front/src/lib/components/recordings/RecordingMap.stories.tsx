import type { Meta, StoryObj } from "@storybook/react";

import RecordingMap from "@/lib/components/recordings/RecordingMap";

const meta: Meta<typeof RecordingMap> = {
  title: "Recordings/Map",
  component: RecordingMap,
};

export default meta;

type Story = StoryObj<typeof RecordingMap>;

export const Primary: Story = {
  args: {
    latitude: 51.5072,
    longitude: -0.1276,
  },
};

export const WithoutLocation: Story = {
  args: {
    latitude: null,
    longitude: null,
  },
};
