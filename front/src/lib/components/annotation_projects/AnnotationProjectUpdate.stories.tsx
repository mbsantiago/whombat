import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectUpdate from "./AnnotationProjectUpdate";

const meta: Meta<typeof AnnotationProjectUpdate> = {
  title: "AnnotationProject/Update",
  component: AnnotationProjectUpdate,
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectUpdate>;

export const Primary: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
    },
    onChangeAnnotationProject: fn()
  },
};
