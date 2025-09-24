import type { InputHTMLAttributes, ComponentType } from "react";
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
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ type = "text", icon: Icon, className, ref, ...props }: InputProps) {
  return (
    <div className={style.inputWrapper}>
      {Icon && <Icon className={style.icon} />}
      <input {...props} ref={ref} type={type} className={`${style.input} ${className ?? ""}`} />
    </div>
  );
}

export default Input;
