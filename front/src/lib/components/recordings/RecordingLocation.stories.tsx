import RecordingLocation from "@/lib/components/recordings/RecordingLocation";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof RecordingLocation> = {
  title: "Recordings/Location",
  component: RecordingLocation,
};

export default meta;

type Story = StoryObj<typeof RecordingLocation>;

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
