import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AnnotationTask } from "@/lib/types";

import AnnotationProgress from "./AnnotationProgress";

const meta: Meta<typeof AnnotationProgress> = {
  title: "Annotation/Progress",
  component: AnnotationProgress,
};

export default meta;

type Story = StoryObj<typeof AnnotationProgress>;

export const Empty: Story = {
  args: {
    filter: {},
    tasks: [],
    instructions: "Annotation instructions",
  },
};

export const Pending: Story = {
  args: {
    current: 0,
    filter: {},
    tasks: [
      {
        uuid: "1",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const WithCompleted: Story = {
  args: {
    current: 0,
    filter: {},
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "completed" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const WithRejected: Story = {
  args: {
    current: 0,
    filter: {},
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "rejected" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const WithVerified: Story = {
  args: {
    current: 0,
    filter: {},
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "verified" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const PendingOnly: Story = {
  args: {
    current: 0,
    filter: {
      pending: true,
    },
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "completed" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const IssuesOnly: Story = {
  args: {
    current: 0,
    filter: {
      rejected: true,
    },
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "completed" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [{ state: "rejected" }],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    instructions: "Annotation instructions",
  },
};

export const FixedDataset: Story = {
  args: {
    filter: {
      dataset: {
        uuid: "1",
        audio_dir: "",
        name: "dataset",
        recording_count: 0,
        description: "test dataset",
        created_on: new Date(),
      },
    },
    tasks: [
      {
        uuid: "1",
        status_badges: [{ state: "completed" }],
        created_on: new Date(),
      } as AnnotationTask,
      {
        uuid: "2",
        status_badges: [{ state: "rejected" }],
        created_on: new Date(),
      } as AnnotationTask,
    ],
    current: 0,
    fixedFilterFields: ["dataset"],
    instructions: "Annotation instructions",
  },
};
