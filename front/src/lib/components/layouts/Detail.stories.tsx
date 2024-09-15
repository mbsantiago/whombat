import type { Meta, StoryObj } from "@storybook/react";

import Detail from "./Detail";

const meta: Meta<typeof Detail> = {
  title: "Layout/Detail",
  component: Detail,
};

export default meta;

type Story = StoryObj<typeof Detail>;

export const Primary: Story = {
  args: {
    SideBar: (
      <div className="border border-black w-100 h-100">Side bar content</div>
    ),
    MainContent: <div className="border border-black">Content</div>,
  },
};
