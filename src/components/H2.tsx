import styles from "./H2.module.css";

interface H2Props {
  children: React.ReactNode;
  className?: string;
}

export function H2({ children, className }: H2Props) {
  return (
    <h2 className={className ? `${styles.h2} ${className}` : styles.h2}>
      {children}
    </h2>
  );
}
