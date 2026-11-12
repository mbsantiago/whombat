import type { Meta, StoryObj } from "@storybook/nextjs";

import SearchMenu from "./SearchMenu";

const meta: Meta<typeof SearchMenu> = {
  title: "Search/SearchMenu",
  component: SearchMenu,
};

export default meta;

type Story = StoryObj<typeof SearchMenu>;

const options = [
  { id: "one", name: "One" },
  { id: "two", name: "Two" },
  { id: "three", name: "Three" },
];

export const Primary: Story = {
  render: () => (
    <SearchMenu
      options={options}
      fields={["name"]}
      renderOption={(option) => option.name}
      getOptionKey={(option) => option.id}
      displayValue={(option) => option.name}
      static={false}
    />
  ),
};
