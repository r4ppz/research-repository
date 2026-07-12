import { ChevronDown } from "lucide-react";
import {
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  Button,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  Popover,
  SelectValue,
  type ValidationResult,
} from "react-aria-components";
import { Description, FieldError, Label } from "../Form/Form";
import styles from "./Select.module.css";

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, "children"> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  ...props
}: SelectProps<T>) {
  return (
    <div className={styles.select}>
      <AriaSelect {...props}>
        {label && <Label>{label}</Label>}

        <Button className={styles.trigger}>
          <SelectValue className={styles.selectValue} />
          <ChevronDown className={styles.chevron} aria-hidden="true" />
        </Button>

        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>

        <Popover className={styles.popover} offset={4}>
          <ListBox className={styles.listBox} shouldFocusWrap>
            {children}
          </ListBox>
        </Popover>
      </AriaSelect>
    </div>
  );
}

export type { ListBoxItemProps as SelectItemProps };
export const SelectItem = ListBoxItem;
