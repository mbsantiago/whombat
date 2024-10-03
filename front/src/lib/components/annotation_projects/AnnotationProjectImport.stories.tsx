import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

import AnnotationProjectImport from "./AnnotationProjectImport";

const meta: Meta<typeof AnnotationProjectImport> = {
  title: "AnnotationProject/Import",
  component: AnnotationProjectImport,
};

export default meta;

type Story = StoryObj<typeof AnnotationProjectImport>;

export const Primary: Story = {
  args: {
    onImportAnnotationProject: fn(),
  },
};
