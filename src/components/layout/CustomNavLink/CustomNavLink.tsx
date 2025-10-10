import clsx from "clsx";
import { NavLink, type NavLinkProps } from "react-router-dom";
import style from "./CustomNavLink.module.css";

interface CustomNavLinkProps extends NavLinkProps {
  className?: string;
}

export default function CustomNavLink({ className, ...props }: CustomNavLinkProps) {
  return (
    <NavLink
      className={({ isActive }) => clsx(style.navlink, isActive && style.active, className)}
      {...props}
    />
  );
}
