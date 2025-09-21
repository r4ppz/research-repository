import type { InputHTMLAttributes, ComponentType, ChangeEvent } from "react";
import style from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: string;
  icon?: ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function Input({ type = "text", icon: Icon, placeholder, value, onChange, ...props }: InputProps) {
  return (
    <div className={style.inputWrapper}>
      {Icon && <Icon className={style.icon} />}
      <input
        {...props}
        type={type}
        className={style.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default Input;
