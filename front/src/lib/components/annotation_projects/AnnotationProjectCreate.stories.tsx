import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectCreate from "./AnnotationProjectCreate";

const meta: Meta<typeof AnnotationProjectCreate> = {
  title: "AnnotationProject/Create",
  component: AnnotationProjectCreate,
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectCreate>;

export const Primary: Story = {
  args: {
    onCreateAnnotationProject: fn(),
  },
};
