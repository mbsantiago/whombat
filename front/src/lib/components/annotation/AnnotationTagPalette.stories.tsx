import type { Meta, StoryObj } from "@storybook/react";

import AnnotationTagPalette from "./AnnotationTagPalette";

const meta: Meta<typeof AnnotationTagPalette> = {
  title: "Annotation/TagPalette",
  component: AnnotationTagPalette,
};

export default meta;

type Story = StoryObj<typeof AnnotationTagPalette>;

export const Empty: Story = {
  args: {
    tags: [],
  },
};
