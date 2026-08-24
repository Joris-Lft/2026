import { useMemo } from "react";
import type { AnchorHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkWikiLink } from "@/utils/remark-wikilink";
import { WikiLink } from "./WikiLink";
import type { WikiLinkOptions } from "./WikiLink";
import styles from "./Markdown.module.css";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface MarkdownProps {
  children: string;
  className?: string;
  compact?: boolean;
  /**
   * Active les liens `[[...]]`. Absent : le plugin n'est pas chargé et
   * `[[x]]` s'affiche littéralement, comme partout ailleurs dans l'app.
   * L'objet doit être mémoïsé par l'appelant, sinon react-markdown
   * reconstruit son processor à chaque rendu.
   */
  wikiLinks?: WikiLinkOptions;
}

const baseComponents = {
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

export function Markdown({
  children,
  className,
  compact,
  wikiLinks,
}: MarkdownProps) {
  const remarkPlugins = useMemo(
    () => (wikiLinks ? [remarkGfm, remarkWikiLink] : [remarkGfm]),
    [wikiLinks],
  );

  const components = useMemo(
    () =>
      wikiLinks
        ? {
            ...baseComponents,
            wikilink: (props: {
              wikitarget?: string;
              wikialias?: string;
              children?: React.ReactNode;
            }) => <WikiLink {...props} options={wikiLinks} />,
          }
        : baseComponents,
    [wikiLinks],
  );

  return (
    <div className={joinClasses(styles.markdown, compact && styles.compact, className)}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
