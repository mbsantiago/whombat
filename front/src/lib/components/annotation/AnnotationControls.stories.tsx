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
    mode: "select",
  },
};

export const Drawing: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "draw",
  },
};

export const Editing: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "edit",
  },
};

export const Deleting: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "delete",
  },
};

export const BoundingBox: Story = {
  args: {
    geometryType: "BoundingBox",
    mode: "idle",
  },
};

export const TimeStamp: Story = {
  args: {
    geometryType: "TimeStamp",
    mode: "idle",
  },
};

export const TimeInterval: Story = {
  args: {
    geometryType: "TimeInterval",
    mode: "idle",
  },
};

export const LineString: Story = {
  args: {
    geometryType: "LineString",
    mode: "idle",
  },
};
