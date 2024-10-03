import type { Meta, StoryObj } from "@storybook/react";

import Description from "./Description";

const meta: Meta<typeof Description> = {
  title: "UI/Description",
  component: Description,
};

export default meta;

type Story = StoryObj<typeof Description>;

export const Primary: Story = {
  args: {
    name: "Temperature",
    value: 13.45,
  },
};

export const EditableText: Story = {
  args: {
    name: "Site",
    value: "Site Name",
    editable: true,
  },
};

export const EditableTextArea: Story = {
  args: {
    name: "Description",
    value: "This is a description",
    editable: true,
    type: "textarea",
  },
};

export const EditableNumber: Story = {
  args: {
    name: "Number",
    value: 123,
    editable: true,
    type: "number",
  },
};

export const EditableDate: Story = {
  args: {
    name: "Date",
    value: new Date(),
    editable: true,
    type: "date",
  },
};

export const EditableEmail: Story = {
  args: {
    name: "Email",
    value: "email@domain.com",
    editable: true,
    type: "email",
  },
};
