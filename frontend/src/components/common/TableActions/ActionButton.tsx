import clsx from "clsx";
import { type ReactNode } from "react";
import styles from "./ActionButton.module.css";
import { Button } from "@/components/common/Button/Button";

interface ActionButtonProps {
  icon?: ReactNode;
  label?: string;
  isPending?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
}

export const ActionButton = ({
  icon,
  label,
  isPending,
  isDisabled,
  onPress,
}: ActionButtonProps) => (
  <Button
    variant="secondary"
    className={clsx(styles.actionButton, !label && icon && styles.iconOnly)}
    isPending={isPending}
    isDisabled={isDisabled}
    onPress={onPress}
  >
    {icon && <span className={styles.actionIcon}>{icon}</span>}
    {label && <span>{label}</span>}
  </Button>
);
