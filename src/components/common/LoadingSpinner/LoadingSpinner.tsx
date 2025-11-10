import clsx from "clsx";
import style from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  className?: string;
  message?: string;
}

const LoadingSpinner = ({ className, message }: LoadingSpinnerProps) => {
  return (
    <div className={clsx(style.container, className)}>
      <div className={clsx(style.spinner, style.size)} />
      {message && <p className={style.message}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
