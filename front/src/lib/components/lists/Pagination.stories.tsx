import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import Pagination from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "List/Pagination",
  component: Pagination,
  args: {
    onSetPage: fn(),
    onNextPage: fn(),
    onPrevPage: fn(),
    onSetPageSize: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof Pagination>;

export const Primary: Story = {
  args: {
    page: 0,
    numPages: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

export const ManyPages: Story = {
  args: {
    page: 1,
    numPages: 10,
    pageSize: 10,
    hasNextPage: true,
    hasPrevPage: true,
  },
};
