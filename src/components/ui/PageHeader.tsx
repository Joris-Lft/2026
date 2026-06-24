import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  align?: "start" | "center";
  actionsAlign?: "end" | "start" | "between";
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  actions,
  align = "start",
  actionsAlign = "end",
}: PageHeaderProps) {
  return (
    <header
      className={joinClasses(
        styles.header,
        align === "center" && styles.centered,
      )}
    >
      <h1 className={styles.title}>{title}</h1>
      {actions && (
        <div
          className={joinClasses(
            styles.actions,
            actionsAlign === "start" && styles.actionsStart,
            actionsAlign === "between" && styles.actionsBetween,
          )}
        >
          {actions}
        </div>
      )}
    </header>
  );
}
