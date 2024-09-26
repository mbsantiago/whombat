import type { Meta, StoryObj } from "@storybook/react";

import Info from "./Info";

const meta: Meta<typeof Info> = {
  title: "UI/Info",
  component: Info,
};

export default meta;

type Story = StoryObj<typeof Info>;

export const Primary: Story = {
  args: {
    title: "Info Title",
    children: "Info Content",
  },
};

export const WithComplexContent: Story = {
  args: {
    title: "Info Title",
    children: (
      <>
        <h1>Into section</h1>
        <p>Info Content</p>
        <p>More Info Content</p>
        <h2>Sub Info Section</h2>
        <p>lorem</p>
      </>
    ),
  },
};

export const WithCustomClass: Story = {
  args: {
    title: "Info Title",
    children: "Info Content",
    className: "bg-red-500",
  },
};
