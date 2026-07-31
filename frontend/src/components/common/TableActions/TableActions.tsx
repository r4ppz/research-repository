import type { ReactNode } from "react";
import styles from "./TableActions.module.css";

interface TableActionsProps {
  children: ReactNode;
}

export const TableActions = ({ children }: TableActionsProps) => (
  <div className={styles.actions}>{children}</div>
);
