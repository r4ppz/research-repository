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
  placeholder?: string;
}

function Input({ type = "text", icon: Icon, placeholder, ...props }: InputProps) {
  return (
    <div className={style.inputWrapper}>
      {Icon && <Icon className={style.icon} />}
      <input {...props} type={type} className={style.input.trim()} placeholder={placeholder} />
    </div>
  );
}

export default Input;
