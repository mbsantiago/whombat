import type { Meta, StoryObj } from "@storybook/react";

import ListBox from "./ListBox";
import { Item, Section } from "react-stately";

const meta: Meta<typeof ListBox> = {
  title: "UI/ListBox",
  component: ListBox,
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ListBox>;

export const Primary: Story = {
  render: () => (
    <ListBox aria-label="Simple">
      <Item>One</Item>
      <Item>Two</Item>
      <Item>Three</Item>
    </ListBox>
  ),
};

export const WithSelected: Story = {
  render: () => (
    <ListBox
      aria-label="WithSelected"
      selectedKeys={new Set(["One"])}
      selectionMode="multiple"
    >
      <Item key="One">One</Item>
      <Item key="Two">Two</Item>
      <Item key="Three">Three</Item>
    </ListBox>
  ),
};

export const WithDisabled: Story = {
  render: () => (
    <ListBox aria-label="WithDisabled" disabledKeys={new Set(["One"])}>
      <Item key="One">One</Item>
      <Item key="Two">Two</Item>
      <Item key="Three">Three</Item>
    </ListBox>
  ),
};

export const WithSection: Story = {
  render: () => (
    <ListBox aria-label="WithSection">
      <Section title="Section 1">
        <Item>One</Item>
        <Item>Two</Item>
        <Item>Three</Item>
        <Item>Four</Item>
        <Item>Five</Item>
      </Section>
      <Section title="Section 2">
        <Item>A</Item>
        <Item>B</Item>
        <Item>C</Item>
      </Section>
    </ListBox>
  ),
};

export const Dynamic: Story = {
  render: () => (
    <ListBox
      items={[
        { key: "One", value: "One" },
        { key: "Two", value: "Two" },
        { key: "Three", value: "Three" },
      ]}
      aria-label="WithSection"
    >
      {(item: { key: string; value: string }) => (
        <Item key={item.key}>{item.value}</Item>
      )}
    </ListBox>
  ),
};
