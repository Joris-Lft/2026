import type { ReactNode } from "react";
import { useLocation } from "react-router";
import styles from "./PageTransition.module.css";

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className={styles.page}>
      {children}
    </div>
  );
}
