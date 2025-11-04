import clsx from "clsx";
import { type ComponentType, type TextareaHTMLAttributes, type Ref } from "react";
import style from "./Textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  ref?: Ref<HTMLTextAreaElement>;
  icon?: ComponentType<{ className?: string }>;
}

function Textarea({ className, ref, icon: Icon, ...props }: TextareaProps) {
  return (
    <div className={clsx(style.textareaContainer, className)}>
      {Icon && <Icon className={style.icon} />}
      <textarea {...props} ref={ref} className={style.textarea} />
    </div>
  );
}

export default Textarea;
