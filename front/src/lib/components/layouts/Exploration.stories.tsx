import type { Meta, StoryObj } from "@storybook/react";

import Pagination from "@/lib/components/lists/Pagination";

import ListCounts from "../lists/ListCounts";
import Exploration from "./Exploration";

const meta: Meta<typeof Exploration> = {
  title: "Layout/Exploration",
  component: Exploration,
  args: {
    Counts: <ListCounts total={10} startIndex={1} endIndex={3} />,
    Pagination: <Pagination />,
    children: <div>Content</div>,
  },
  parameters: { controls: { exclude: ["Pagination", "children", "Counts"] } },
};

export default meta;

type Story = StoryObj<typeof Exploration>;

export const Primary: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
