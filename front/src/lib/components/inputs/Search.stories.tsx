import type { Meta, StoryObj } from "@storybook/react";

import { CheckIcon } from "@/lib/components/icons";

import Search from "./Search";

const meta: Meta<typeof Search> = {
  title: "Inputs/Search",
  component: Search,
};

export default meta;

type Story = StoryObj<typeof Search>;

export const Primary: Story = {
  args: {},
};

export const IsLoading: Story = {
  args: {
    isLoading: true,
  },
};

export const CustomIcon: Story = {
  args: {
    icon: <CheckIcon />,
  },
};
