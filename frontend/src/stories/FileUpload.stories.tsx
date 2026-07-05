import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileUpload } from "@/features/admin/components/FileUpload/FileUpload";

const meta: Meta<typeof FileUpload> = {
  component: FileUpload,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof FileUpload>;

function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div style={{ width: 400 }}>
      <FileUpload id="file-upload" value={file} onChange={setFile} />
    </div>
  );
}

export const Default: Story = {
  render: () => <FileUploadDemo />,
};

function FileUploadWithFileDemo() {
  const [file, setFile] = useState<File | null>(
    new File(["dummy content"], "research-paper.pdf", { type: "application/pdf" }),
  );

  return (
    <div style={{ width: 400 }}>
      <FileUpload id="file-upload" value={file} onChange={setFile} />
    </div>
  );
}

export const WithFileSelected: Story = {
  render: () => <FileUploadWithFileDemo />,
};
