import type { Meta, StoryObj } from "@storybook/react";

import { CheckIcon } from "@/lib/components/icons";

import Tab from "../ui/Tab";
import SectionTabs from "./SectionTabs";

const meta: Meta<typeof SectionTabs> = {
  title: "Navigation/SectionTabs",
  component: SectionTabs,
};

export default meta;

type Story = StoryObj<typeof SectionTabs>;

export const Primary: Story = {
  args: {
    title: "Section Tabs",
    tabs: [
      <Tab key="tab1">Tab 1</Tab>,
      <Tab key="tab2">Tab 2</Tab>,
      <Tab active key="tab3">
        Tab 3
      </Tab>,
      <Tab key="tab3" className="bg-yellow-500">
        With custom styles
      </Tab>,
      <Tab key="tab4">
        <CheckIcon className="w-4 h-4" />
        With Icon
      </Tab>,
    ],
  },
};
