import clsx from "clsx";
import { type ComponentType, type InputHTMLAttributes, forwardRef } from "react";
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
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = "text", icon: Icon, className, ...props }, ref) => {
    return (
      <div className={clsx(style.inputWrapper, className)}>
        {Icon && <Icon className={style.icon} />}
        <input ref={ref} type={type} className={style.input} {...props} />
      </div>
    );
  },
);

export default Input;
