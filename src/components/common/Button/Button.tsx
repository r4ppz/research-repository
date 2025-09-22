import React from "react";
import style from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const buttonClass = `${style.button} ${style[variant]} ${className}`.trim();

  return (
    <button type="button" className={buttonClass} {...props}>
      {children}
    </button>
  );
}

export default Button;
