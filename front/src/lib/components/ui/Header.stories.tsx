import type { Meta, StoryObj } from "@storybook/react";

import Header from "./Header";

const meta: Meta<typeof Header> = {
  title: "UI/Header",
  component: Header,
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Primary: Story = {
  args: {
    children: "Header",
  },
};

export const WithComplexContent: Story = {
  args: {
    children: (
      <>
        <h1 className="text-2xl font-bold">Header</h1>
        <p className="text-gray-500">This is a header</p>
      </>
    ),
  },
};
