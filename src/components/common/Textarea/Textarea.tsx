import clsx from "clsx";
import { type ComponentType, type TextareaHTMLAttributes, type Ref } from "react";
import style from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
  icon?: ComponentType<{ className?: string; size?: number }>;
  size?: number;
}

function Textarea({ className, ref, icon: Icon, size = 18, ...props }: TextareaProps) {
  return (
    <div className={clsx(style.textareaContainer, className)}>
      {Icon && <Icon className={style.icon} size={size} />}
      <textarea {...props} ref={ref} className={style.textarea} />
    </div>
  );
}

export default Textarea;
