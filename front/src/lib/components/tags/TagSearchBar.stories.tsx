import type { Meta, StoryObj } from "@storybook/react";
import { fn } from '@storybook/test';

import { TagSearchBarComponent } from "./TagSearchBar";

const meta: Meta<typeof TagSearchBarComponent> = {
  title: "Tags/TagSearchBar",
  component: TagSearchBarComponent,
};

export default meta;

type Story = StoryObj<typeof TagSearchBarComponent>;

export const Primary: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
    onChange: fn(),
    canCreate: true,
  },
};

export const Loading: Story = {
  args: {
    onSelect: fn(),
    onCreate: fn(),
    onChange: fn(),
    canCreate: true,
    isLoading: true,
  },
};
