import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, SelectItem } from "@/components/common/Select/Select";

const meta: Meta<typeof Select> = {
  component: Select,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof Select>;

const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

export const Default: Story = {
  args: {
    label: "Choose a fruit",
    placeholder: "Select a fruit",
    children: fruits.map((fruit) => <SelectItem id={fruit}>{fruit}</SelectItem>),
  },
};

export const WithDescription: Story = {
  args: {
    label: "Choose a fruit",
    description: "Pick your favorite fruit from the list",
    placeholder: "Select a fruit",
    children: fruits.map((fruit) => <SelectItem id={fruit}>{fruit}</SelectItem>),
  },
};

export const Disabled: Story = {
  args: {
    label: "Choose a fruit",
    placeholder: "Select a fruit",
    isDisabled: true,
    children: fruits.map((fruit) => <SelectItem id={fruit}>{fruit}</SelectItem>),
  },
};
