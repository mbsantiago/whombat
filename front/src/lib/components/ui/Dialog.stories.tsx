import type { Meta, StoryObj } from "@storybook/react";

import Button from "./Button";
import Dialog from "./Dialog";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Primary: Story = {
  args: {
    title: "Dialog Title",
    children: () => <p>Dialog Content</p>,
    label: "Dialog Label",
  },
};

export const Wide: Story = {
  args: {
    title: "Dialog Title",
    width: "w-96",
    children: () => <p>Dialog Content</p>,
    label: "Dialog Label",
  },
};

export const Text: Story = {
  args: {
    title: "Dialog Title",
    mode: "text",
    children: () => <p>Dialog Content</p>,
    label: "Dialog Label",
  },
};

export const WithCustomCloseButton: Story = {
  args: {
    title: "Dialog Title",
    children: ({ close }) => (
      <>
        <p>Dialog Content</p>
        <Button onClick={close}>Close Here Also!</Button>
      </>
    ),
    label: "Dialog Label",
  },
};
