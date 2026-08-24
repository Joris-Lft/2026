import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, RefObject } from "react";
import type { NoteLinkCandidate } from "./use-note-links";
import { MAX_NOTE_TITLE_LENGTH, titleKey } from "@/utils/notes";

/** `[[` puis tout sauf un crochet ou un saut de ligne, jusqu'au curseur. */
const TRIGGER_REGEX = /\[\[([^[\]\n]*)$/;
const MAX_QUERY_LENGTH = MAX_NOTE_TITLE_LENGTH;
const MAX_SUGGESTIONS = 8;

/**
 * Repli sans accents ni casse, pour la seule *recherche* : taper « idees »
 * doit proposer « Idées ». La résolution des liens, elle, reste sur
 * `titleKey`, plus stricte.
 */
function searchKey(value: string): string {
  return titleKey(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/** Id d'une option, partagé entre `aria-activedescendant` et la liste. */
export function optionId(listId: string, index: number) {
  return `${listId}-option-${index}`;
}

interface UseWikiLinkAutocompleteParams {
  value: string;
  onChange: (next: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  candidates: NoteLinkCandidate[];
  /** Note en cours d'édition, exclue des suggestions. */
  currentNoteId?: string;
}

export function useWikiLinkAutocomplete({
  value,
  onChange,
  textareaRef,
  candidates,
  currentNoteId,
}: UseWikiLinkAutocompleteParams) {
  const [query, setQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Après une insertion ou un Échap, on ne rouvre pas tant que le curseur
  // n'a pas quitté la zone du déclencheur.
  const dismissedAtRef = useRef<number | null>(null);

  const close = useCallback(() => {
    setQuery(null);
    setActiveIndex(0);
  }, []);

  const suggestions = buildSuggestions(query, candidates, currentNoteId);
  const isOpen = query !== null && suggestions.length > 0;

  /** Réévalue le déclencheur : le curseur bouge aussi sans changement de valeur. */
  const syncFromCaret = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const caret = textarea.selectionStart ?? 0;
    const match = TRIGGER_REGEX.exec(textarea.value.slice(0, caret));

    if (!match || match[1].length > MAX_QUERY_LENGTH) {
      dismissedAtRef.current = null;
      close();
      return;
    }

    const triggerStart = caret - match[1].length - 2;
    if (dismissedAtRef.current === triggerStart) return;

    dismissedAtRef.current = null;
    setQuery(match[1]);
    setActiveIndex(0);
  }, [close, textareaRef]);

  const insert = useCallback(
    (candidate: NoteLinkCandidate) => {
      const textarea = textareaRef.current;
      if (textarea === null || query === null) return;

      const caret = textarea.selectionStart ?? 0;
      const triggerStart = caret - query.length - 2;
      const insertion = buildInsertion(candidate);
      const next =
        value.slice(0, triggerStart) + insertion + value.slice(caret);

      onChange(next);
      dismissedAtRef.current = null;
      close();

      // React doit avoir commité la valeur contrôlée avant qu'on déplace le curseur.
      queueMicrotask(() => {
        const position = triggerStart + insertion.length;
        textarea.focus();
        textarea.setSelectionRange(position, position);
      });
    },
    [close, onChange, query, textareaRef, value],
  );

  /**
   * Échap ferme la liste, pas la modale. Un écouteur en capture sur window
   * passe forcément avant celui, en bulle, de `Modal` — contrairement à un
   * stopPropagation React, dont l'effet dépend de la délégation à travers le
   * portail de la modale.
   */
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDownCapture = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      event.preventDefault();

      const caret = textareaRef.current?.selectionStart ?? 0;
      dismissedAtRef.current = caret - (query?.length ?? 0) - 2;
      close();
    };

    window.addEventListener("keydown", onKeyDownCapture, true);
    return () => window.removeEventListener("keydown", onKeyDownCapture, true);
  }, [close, isOpen, query, textareaRef]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) return;
      if (!isOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => (index + 1) % suggestions.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(
          (index) => (index - 1 + suggestions.length) % suggestions.length,
        );
      } else if (event.key === "Enter" || event.key === "Tab") {
        // Les suggestions peuvent rétrécir entre le survol et la validation
        // (refetch react-query en arrière-plan).
        const candidate = suggestions[activeIndex];
        if (!candidate) return;
        event.preventDefault();
        insert(candidate);
      }
    },
    [activeIndex, insert, isOpen, suggestions],
  );

  return {
    isOpen,
    suggestions,
    activeIndex,
    setActiveIndex,
    syncFromCaret,
    handleKeyDown,
    insert,
    close,
  };
}

/**
 * Texte à insérer pour cibler une note. La syntaxe interdit `[`, `]` et `|`
 * dans la cible : un titre qui en contient (tableau markdown, « Courses |
 * Semaine 12 »…) donnerait un lien mort, donc on cible le numéro de note.
 */
function buildInsertion(candidate: NoteLinkCandidate): string {
  const { title, noteNumber } = candidate;

  if (title && !/[[\]|]/.test(title)) return `[[${title}]]`;
  if (noteNumber <= 0) return `[[${title}]]`;
  // L'alias, lui, accepte `|` — on garde donc le titre lisible quand on peut.
  if (title && !/[[\]]/.test(title)) return `[[#${noteNumber}|${title}]]`;

  return `[[#${noteNumber}]]`;
}

function buildSuggestions(
  query: string | null,
  candidates: NoteLinkCandidate[],
  currentNoteId?: string,
): NoteLinkCandidate[] {
  if (query === null) return [];

  const pool = candidates.filter(
    (candidate) => candidate.id !== currentNoteId && candidate.title,
  );
  const trimmed = query.trim();

  if (!trimmed) return pool.slice(0, MAX_SUGGESTIONS);

  // `#12` cible directement un numéro de note.
  if (trimmed.startsWith("#")) {
    const digits = trimmed.slice(1);
    return pool
      .filter((candidate) => String(candidate.noteNumber).startsWith(digits))
      .slice(0, MAX_SUGGESTIONS);
  }

  const key = searchKey(trimmed);
  const matches = pool.filter((candidate) =>
    searchKey(candidate.title).includes(key),
  );

  // Les correspondances en début de titre d'abord.
  return matches
    .sort((a, b) => {
      const aPrefix = searchKey(a.title).startsWith(key) ? 0 : 1;
      const bPrefix = searchKey(b.title).startsWith(key) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return a.title.localeCompare(b.title, "fr");
    })
    .slice(0, MAX_SUGGESTIONS);
}
