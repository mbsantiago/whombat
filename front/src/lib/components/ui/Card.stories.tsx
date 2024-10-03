import type { Meta, StoryObj } from "@storybook/react";

import Card from "./Card";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Primary: Story = {
  args: {
    children: "Card Content",
  },
};

export const WithAdditionalClasses: Story = {
  args: {
    children: "Card Content",
    className: "bg-emerald-500 border-4 border-stone-900",
  },
};

export const WithCustomStyles: Story = {
  args: {
    children: "Card Content",
    style: { boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)" },
  },
};

export const WithComplexContent: Story = {
  args: {
    children: (
      <>
        <h2 className="text-xl font-bold">Card Title</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
          suscipit, nunc sit amet tempor varius, purus purus posuere nunc, et
          aliquam odio sapien nec sapien.
        </p>
      </>
    ),
  },
};
