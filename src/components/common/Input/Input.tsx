import clsx from "clsx";
import { type InputHTMLAttributes, type ComponentType, type Ref } from "react";

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
  icon?: ComponentType<{ className?: string; size?: number }>;
  className?: string;
  ref?: Ref<HTMLInputElement>;
  size?: number;
}

function Input({ type = "text", icon: Icon, className, ref, size = 18, ...props }: InputProps) {
  return (
    <div className={clsx(style.inputWrapper, className)}>
      {Icon && <Icon className={style.icon ?? ""} size={size} />}
      <input {...props} ref={ref} type={type} className={style.input} />
    </div>
  );
}

export default Input;
