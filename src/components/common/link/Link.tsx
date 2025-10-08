import React from "react";
import clsx from "clsx";
import style from "./Link.module.css";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

function Link({
  href,
  children,
  className,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: LinkProps) {
  return (
    <a href={href} className={clsx(style.link, className)} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
}

export default Link;
