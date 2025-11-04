import clsx from "clsx";
import { type ComponentType, type InputHTMLAttributes, type Ref } from "react";
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

function Input({ type = "text", icon: Icon, className, ref, ...props }: InputProps) {
  return (
    <div className={clsx(style.inputWrapper, className)}>
      {Icon && <Icon className={style.icon} />}
      <input {...props} ref={ref} type={type} className={style.input} />
    </div>
  );
}

export default Input;
