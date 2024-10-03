import type { Meta, StoryObj } from "@storybook/react";
import { Item } from "react-stately";

import ComboBox from "./ComboBox";

const meta: Meta<typeof ComboBox> = {
  title: "UI/ComboBox",
  component: ComboBox,
};

export default meta;

type Story = StoryObj<typeof ComboBox>;

export const Primary: Story = {
  render: () => (
    <ComboBox
      label="ComboBox"
      defaultItems={[
        { id: 1, email: "fake@email.com" },
        { id: 2, email: "anotherfake@email.com" },
        { id: 3, email: "bob@email.com" },
        { id: 4, email: "joe@email.com" },
        { id: 5, email: "yourEmail@email.com" },
        { id: 6, email: "valid@email.com" },
        { id: 7, email: "spam@email.com" },
        { id: 8, email: "newsletter@email.com" },
        { id: 9, email: "subscribe@email.com" },
      ]}
    >
      {(item: { id: number; email: string }) => <Item>{item.email}</Item>}
    </ComboBox>
  ),
};
