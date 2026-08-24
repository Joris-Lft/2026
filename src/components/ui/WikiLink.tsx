import type { ReactNode } from "react";
import type { WikiLinkResolution } from "@/utils/wikilinks";
import styles from "./WikiLink.module.css";

export interface WikiLinkOptions {
  /** Résout une cible `[[...]]` contre l'index des notes. */
  resolve: (target: string) => WikiLinkResolution;
  /**
   * Rend les liens cliquables. Absent (aperçus de carte, dont la racine est
   * déjà un `<button>`) : rendu en `<span>` inerte.
   */
  onNavigate?: (noteId: string) => void;
}

interface WikiLinkProps {
  wikitarget?: string;
  wikialias?: string;
  children?: ReactNode;
  options: WikiLinkOptions;
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function WikiLink({
  wikitarget = "",
  wikialias = "",
  children,
  options,
}: WikiLinkProps) {
  const resolution = options.resolve(wikitarget);

  // `[[#42]]` afficherait « #42 » : on lui substitue le titre de la note, sauf
  // si l'auteur a explicitement fourni un libellé.
  const isNumericTarget = /^#\d+$/.test(wikitarget.trim());
  const label =
    !wikialias && isNumericTarget && resolution.status !== "broken"
      ? resolution.title
      : children;

  if (resolution.status === "broken") {
    return (
      <span className={styles.broken} title="Aucune note ne porte ce titre">
        {label}
      </span>
    );
  }

  if (resolution.status === "self") {
    return (
      <span className={styles.self} aria-current="true" title="Cette note">
        {label}
      </span>
    );
  }

  const ambiguityHint = resolution.ambiguous
    ? " (plusieurs notes portent ce titre, la plus ancienne est ouverte)"
    : "";

  if (!options.onNavigate) {
    return (
      <span className={joinClasses(styles.link, resolution.ambiguous && styles.ambiguous)}>
        {label}
      </span>
    );
  }

  const { onNavigate } = options;

  return (
    <button
      type="button"
      className={joinClasses(styles.link, resolution.ambiguous && styles.ambiguous)}
      title={`Ouvrir « ${resolution.title} »${ambiguityHint}`}
      onClick={(event) => {
        event.stopPropagation();
        onNavigate(resolution.noteId);
      }}
    >
      {label}
    </button>
  );
}
