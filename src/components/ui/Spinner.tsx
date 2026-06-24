import styles from "./Spinner.module.css";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerVariant = "default" | "onAccent";

interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
}

export function Spinner({
  size = "md",
  variant = "default",
  label = "Chargement",
}: SpinnerProps) {
  return (
    <span
      className={`${styles.spinner} ${styles[size]} ${styles[variant]}`}
      role="status"
      aria-label={label}
    />
  );
}
