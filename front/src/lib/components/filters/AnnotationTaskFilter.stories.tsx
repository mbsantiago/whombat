import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationTaskFilter from "./AnnotationTaskFilter";

const meta: Meta<typeof AnnotationTaskFilter> = {
  title: "Filters/AnnotationTasks",
  component: AnnotationTaskFilter,
};

export default meta;

type Story = StoryObj<typeof AnnotationTaskFilter>;

export const Primary: Story = {
  args: {
    filter: {},
    onChangeField: fn(),
  },
};
