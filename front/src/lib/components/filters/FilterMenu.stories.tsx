import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import type { RecordingFilter } from "@/lib/types";

import FilterMenu from "./FilterMenu";
import recordingFilterDefs from "./recordings";

const meta: Meta<typeof FilterMenu<RecordingFilter>> = {
  title: "Filters/Menu",
  component: FilterMenu,
};

export default meta;

type Story = StoryObj<typeof FilterMenu<RecordingFilter>>;

export const Primary: Story = {
  args: {
    button: "Apply filters",
    filterDef: recordingFilterDefs,
    onSetFilterField: fn(),
  },
};
