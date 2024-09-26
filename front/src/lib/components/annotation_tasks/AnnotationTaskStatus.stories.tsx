import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import type { AnnotationTask } from "@/lib/types";

import AnnotationTaskStatus from "./AnnotationTaskStatus";

const meta: Meta<typeof AnnotationTaskStatus> = {
  title: "AnnotationTask/Status",
  component: AnnotationTaskStatus,
  args: {
    onDone: fn(),
    onReview: fn(),
    onVerify: fn(),
    onRemoveBadge: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationTaskStatus>;

const baseTask: AnnotationTask = {
  uuid: "task-1",
  created_on: new Date(),
};

export const NoBadges: Story = {
  args: {
    task: baseTask,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    task: baseTask,
  },
};

export const WithBadges: Story = {
  args: {
    task: {
      ...baseTask,
      status_badges: [{ state: "completed", created_on: new Date() }],
    },
  },
};
