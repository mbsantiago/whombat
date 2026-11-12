import type { Meta, StoryObj } from "@storybook/nextjs";
import { fn } from "storybook/test";

import type { AnnotationStatus, AnnotationTask } from "@/lib/types";

import AnnotationTaskBulletList from "./AnnotationTaskBulletList";

const meta: Meta<typeof AnnotationTaskBulletList> = {
  title: "AnnotationTask/BulletList",
  component: AnnotationTaskBulletList,
  args: {
    onTaskClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof AnnotationTaskBulletList>;

const baseTask: AnnotationTask = {
  uuid: "task-1",
  created_on: new Date(),
};

export const Primary: Story = {
  args: {
    tasks: [baseTask],
  },
};

function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function createTask(status: AnnotationStatus | "pending"): AnnotationTask {
  if (status === "pending") {
    return {
      uuid: randomUUID(),
      created_on: new Date(),
    };
  }

  return {
    uuid: randomUUID(),
    created_on: new Date(),
    status_badges: [{ state: status, created_on: new Date() }],
  };
}

export const Multiple: Story = {
  args: {
    tasks: [
      createTask("pending"),
      createTask("verified"),
      createTask("rejected"),
      createTask("completed"),
      createTask("assigned"),
    ],
  },
};

let activeTask = createTask("pending");

export const WithActiveTask: Story = {
  args: {
    currentTask: activeTask,
    tasks: [
      activeTask,
      createTask("pending"),
      createTask("verified"),
      createTask("rejected"),
      createTask("completed"),
      createTask("assigned"),
    ],
  },
};

function randomState(): AnnotationStatus | "pending" {
  let states: (AnnotationStatus | "pending")[] = [
    "pending",
    "verified",
    "rejected",
    "completed",
    "assigned",
  ];
  let index = Math.floor(Math.random() * states.length);
  return states[index];
}

let manyTasks = [...Array(100)].map(() => createTask(randomState()));

export const ManyTasks: Story = {
  args: {
    currentTask: manyTasks[50],
    tasks: manyTasks,
  },
};
