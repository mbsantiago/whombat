import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectProgress from "./AnnotationProjectProgress";

const meta: Meta<typeof AnnotationProjectProgress> = {
  title: "AnnotationProject/Progress",
  component: AnnotationProjectProgress,
  args: {
    onAddTasks: fn(),
    onClickVerified: fn(),
    onClickPending: fn(),
    onClickReview: fn(),
    onClickCompleted: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectProgress>;

export const Empty: Story = {
  args: {
    annotationTasks: [],
  },
};

export const AllPending: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "1",
        created_on: new Date(),
      },
      {
        uuid: "2",
        created_on: new Date(),
      },
    ],
  },
};

export const SomeCompleted: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "1",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
      {
        uuid: "2",
        created_on: new Date(),
      },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "1",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
      {
        uuid: "2",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
    ],
  },
};

export const WithReview: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "1",
        created_on: new Date(),
        status_badges: [{ state: "rejected", created_on: new Date() }],
      },
      {
        uuid: "2",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
    ],
  },
};

export const WithVerified: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "1",
        created_on: new Date(),
        status_badges: [{ state: "verified", created_on: new Date() }],
      },
      {
        uuid: "2",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
    ],
  },
};

export const WithAll: Story = {
  args: {
    annotationTasks: [
      {
        uuid: "0",
        created_on: new Date(),
      },
      {
        uuid: "1",
        created_on: new Date(),
      },
      {
        uuid: "2",
        created_on: new Date(),
        status_badges: [{ state: "completed", created_on: new Date() }],
      },
      {
        uuid: "3",
        created_on: new Date(),
        status_badges: [{ state: "rejected", created_on: new Date() }],
      },
      {
        uuid: "4",
        created_on: new Date(),
        status_badges: [{ state: "verified", created_on: new Date() }],
      },
    ],
  },
};
