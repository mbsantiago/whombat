import type { Meta, StoryObj } from "@storybook/nextjs";
import { Item } from "react-stately";

import Search from "./Search";

const meta: Meta<typeof Search> = {
  title: "Search/Search",
  component: Search,
};

export default meta;

type Story = StoryObj<typeof Search>;

const options = [
  { id: "one", name: "One" },
  { id: "two", name: "Two" },
  { id: "three", name: "Three" },
];

export const Primary: Story = {
  render: () => (
    <Search
      label="Search options"
      options={options}
      fields={["name"]}
      getOptionKey={(option) => option.id}
      displayValue={(option) => option.name}
    >
      {(option) => <Item key={option.id}>{option.name}</Item>}
    </Search>
  ),
};
