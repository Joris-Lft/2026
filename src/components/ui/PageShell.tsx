import type { ReactNode } from "react";
import styles from "./PageShell.module.css";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `${styles.page} ${className}` : styles.page}>
      {children}
    </div>
  );
}
