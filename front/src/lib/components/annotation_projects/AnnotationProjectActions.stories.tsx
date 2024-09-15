import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectActions from "./AnnotationProjectActions";

const meta: Meta<typeof AnnotationProjectActions> = {
  title: "AnnotationProject/Actions",
  component: AnnotationProjectActions,
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectActions>;

export const Primary: Story = {
  args: {
    annotationProject: {
      uuid: "1",
      name: "Project 1",
      description: "Annotation project 1",
      created_on: new Date(),
    },
    onDeleteAnnotationProject: fn(),
    onDownloadAnnotationProject: fn(),
  },
};
