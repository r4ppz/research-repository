import clsx from "clsx";
import type { ComponentType, InputHTMLAttributes, Ref } from "react";
import { Input as AriaInput } from "react-aria-components";
import style from "./Input.module.css";

type InputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "search"
  | "url"
  | "tel"
  | "date"
  | "datetime-local";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  icon?: ComponentType<{ className?: string }>;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  type = "text",
  icon: Icon,
  className,
  disabled,
  ref,
  ...props
}: InputProps) {
  return (
    <div
      className={clsx(style.inputWrapper, { [style.inputWrapperDisabled]: disabled }, className)}
    >
      {Icon && <Icon className={style.icon} />}
      <AriaInput ref={ref} type={type} className={style.input} disabled={disabled} {...props} />
    </div>
  );
}
