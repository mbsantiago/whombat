import type { Meta, StoryObj } from "@storybook/react";

import AnnotationControls from "./AnnotationControls";

const meta: Meta<typeof AnnotationControls> = {
  title: "Annotation/Controls",
  component: AnnotationControls,
};

export default meta;

type Story = StoryObj<typeof AnnotationControls>;

export const Selecting: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "selecting",
  },
};

export const Drawing: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "drawing",
  },
};

export const Editing: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "editing",
  },
};

export const Deleting: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "deleting",
  },
};

export const BoundingBox: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "none",
  },
};

export const TimeStamp: Story = {
  args: {
    geometryType: "TimeStamp",
    mode: "none",
  },
};

export const TimeInterval: Story = {
  args: {
    geometryType: "TimeInterval",
    mode: "none",
  },
};

export const LineString: Story = {
  args: {
    geometryType: "LineString",
    mode: "none",
  },
};
