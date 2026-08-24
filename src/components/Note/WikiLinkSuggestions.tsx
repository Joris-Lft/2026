import type { NoteLinkCandidate } from "@/hooks/use-note-links";
import { optionId } from "@/hooks/use-wikilink-autocomplete";
import styles from "./WikiLinkSuggestions.module.css";

interface WikiLinkSuggestionsProps {
  id: string;
  suggestions: NoteLinkCandidate[];
  activeIndex: number;
  onHighlight: (index: number) => void;
  onSelect: (candidate: NoteLinkCandidate) => void;
}

export function WikiLinkSuggestions({
  id,
  suggestions,
  activeIndex,
  onHighlight,
  onSelect,
}: WikiLinkSuggestionsProps) {
  return (
    <ul className={styles.results} id={id} role="listbox">
      {suggestions.map((candidate, index) => (
        <li key={candidate.id} role="presentation">
          <button
            type="button"
            id={optionId(id, index)}
            role="option"
            // Le focus reste sur le textarea (pattern combobox +
            // aria-activedescendant) : les options ne sont pas tabbables.
            tabIndex={-1}
            aria-selected={index === activeIndex}
            ref={
              index === activeIndex
                ? (node) => node?.scrollIntoView({ block: "nearest" })
                : undefined
            }
            className={
              index === activeIndex
                ? `${styles.result} ${styles.active}`
                : styles.result
            }
            // Empêche le textarea de perdre le focus (et donc le curseur)
            // avant que le clic ne se déclenche.
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => onHighlight(index)}
            onClick={() => onSelect(candidate)}
          >
            <span className={styles.title}>{candidate.title}</span>
            {candidate.noteNumber > 0 && (
              <span className={styles.number}>#{candidate.noteNumber}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}
