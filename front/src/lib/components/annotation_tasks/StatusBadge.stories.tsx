import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import StatusBadge from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "AnnotationTask/Badge",
  component: StatusBadge,
  args: {
    onClick: fn(),
    onRemove: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Completed: Story = {
  args: {
    badge: {
      created_on: new Date(),
      state: "completed",
    },
  },
};

export const Verified: Story = {
  args: {
    badge: {
      created_on: new Date(),
      state: "verified",
      user: {
        id: "user-1",
        username: "user1",
      },
    },
  },
};

export const Rejected: Story = {
  args: {
    badge: {
      created_on: new Date(),
      state: "rejected",
    },
  },
};

export const Assigned: Story = {
  args: {
    badge: {
      created_on: new Date(),
      state: "assigned",
    },
  },
};
