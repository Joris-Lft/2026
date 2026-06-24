import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./Input.module.css";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={className ? `${styles.input} ${className}` : styles.input}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={className ? `${styles.textarea} ${className}` : styles.textarea}
      {...props}
    />
  );
}

export function ReadOnlyValue({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={className ? `${styles.readOnly} ${className}` : styles.readOnly}
    >
      {children}
    </span>
  );
}
