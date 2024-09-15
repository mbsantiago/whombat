import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import ListSearch from "./ListSearch";

const meta: Meta<typeof ListSearch> = {
  title: "List/Search",
  component: ListSearch,
};

export default meta;

type Story = StoryObj<typeof ListSearch>;

export const Primary: Story = {
  args: {
    limit: 10,
    limitOptions: [5, 10, 20, 50, 100],
    onChangeLimit: fn(),
    onChangeSearch: fn(),
  },
};
