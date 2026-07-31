import clsx from "clsx";
import { type ReactNode } from "react";
import styles from "./TableButton.module.css";
import { Button } from "@/components/common/Button/Button";

interface TableButtonProps {
  icon?: ReactNode;
  label?: string;
  isPending?: boolean;
  isDisabled?: boolean;
  onPress: () => void;
}

export const TableButton = ({ icon, label, isPending, isDisabled, onPress }: TableButtonProps) => (
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
