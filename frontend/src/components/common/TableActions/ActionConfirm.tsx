import type { ReactNode } from "react";
import { ActionButton } from "./ActionButton";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";

interface ActionConfirmProps {
  icon?: ReactNode;
  label?: string;
  isPending?: boolean;
  confirmTitle: string;
  confirmDescription: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

export const ActionConfirm = ({
  icon,
  label,
  isPending,
  confirmTitle,
  confirmDescription,
  confirmText,
  cancelText,
  onConfirm,
}: ActionConfirmProps) => (
  <ConfirmDialog
    title={confirmTitle}
    description={confirmDescription}
    confirmText={confirmText}
    cancelText={cancelText}
    onConfirm={onConfirm}
    trigger={<ActionButton icon={icon} label={label} isPending={isPending} />}
  />
);
