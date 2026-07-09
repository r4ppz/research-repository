import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/Dialog/Dialog";

const meta = {
  component: Dialog,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>The Replay</DialogTitle>
        <DialogDescription>
          This moment is already a memory. You are just watching the playback. You are currently the
          oldest you have ever been and the youngest you will ever be again.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
};
