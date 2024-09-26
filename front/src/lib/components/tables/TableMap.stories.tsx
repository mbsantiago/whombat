import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import TableMap from "./TableMap";

const meta: Meta<typeof TableMap> = {
  title: "Table/Map",
  component: TableMap,
};

export default meta;

type Story = StoryObj<typeof TableMap>;

export const Primary: Story = {
  args: {
    value: {
      latitude: 51.5072,
      longitude: -0.1276,
    },
    onChange: fn(),
  },
};
