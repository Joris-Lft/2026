import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  elevated?: boolean;
} & (
  | ({ as?: "div" } & HTMLAttributes<HTMLDivElement>)
  | ({ as: "button" } & ButtonHTMLAttributes<HTMLButtonElement>)
);

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
  padded = false,
  elevated = false,
  as = "div",
  ...props
}: CardProps) {
  const classes = joinClasses(
    styles.card,
    padded && styles.padded,
    elevated && styles.elevated,
    as === "button" && styles.interactive,
    className,
  );

  if (as === "button") {
    const { type = "button", ...buttonProps } = props as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button type={type} className={classes} {...buttonProps}>
        {children}
      </button>
    );
  }

  return (
    <div className={classes} {...(props as HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
}
