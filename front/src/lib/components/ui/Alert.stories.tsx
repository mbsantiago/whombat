import type { Meta, StoryObj } from "@storybook/react";

import Alert from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Primary: Story = {
  args: {
    variant: "primary",
    button: "Open Alert",
    title: "Alert Title",
    children: ({ close }) => (
      <>
        <strong>Well done!</strong> You successfully read this important alert
        message.
        <button
          onClick={close}
          type="button"
          className="btn-close"
          aria-label="Close"
        ></button>
      </>
    ),
  },
};
