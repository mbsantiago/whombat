import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import FilterMenu from "./FilterMenu";
import recordingFilterDefs from "./recordings";

const meta: Meta<typeof FilterMenu> = {
  title: "Filters/Menu",
  component: FilterMenu,
};

export default meta;

type Story = StoryObj<typeof FilterMenu>;

export const Primary: Story = {
  args: {
    button: "Apply filters",
    filterDef: recordingFilterDefs,
    onSetFilterField: fn(),
  },
};
