import clsx from "clsx";
import { type ButtonHTMLAttributes } from "react";
import style from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const buttonClass = clsx(style.button, style[variant], className);

  return (
    <button type="button" className={buttonClass} {...props}>
      {children}
    </button>
  );
}

export default Button;
