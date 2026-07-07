import type { AnchorHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./Markdown.module.css";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface MarkdownProps {
  children: string;
  className?: string;
  compact?: boolean;
}

const components = {
  a: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className={styles.tableWrapper}>
      <table>{children}</table>
    </div>
  ),
};

export function Markdown({ children, className, compact }: MarkdownProps) {
  return (
    <div className={joinClasses(styles.markdown, compact && styles.compact, className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
