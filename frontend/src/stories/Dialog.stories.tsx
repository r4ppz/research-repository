import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/common/Dialog/Dialog";

const meta = {
  component: Dialog,
  parameters: {
    layout: "centered",
  },
} as Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="primary"
        onPress={() => {
          setOpen(true);
        }}
      >
        Open Dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose
            onClose={() => {
              setOpen(false);
            }}
          />
          <DialogTitle>The Replay</DialogTitle>
          <DialogDescription>
            This moment is already a memory. You are just watching the playback. You are currently
            the oldest you have ever been and the youngest you will ever be again.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: () => <DialogDemo />,
};
