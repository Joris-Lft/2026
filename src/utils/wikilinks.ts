import type { Note } from "@/types/notes";
import { deriveNoteTitle, stripCodeBlocks, titleKey } from "./notes";

/**
 * `[[Titre]]`, `[[Titre|libellé]]` ou `[[#42]]` (numéro de note).
 * La cible ne peut pas contenir de `|`, le libellé si.
 *
 * Fabriquée à la demande : une regex `/g` partagée porte un `lastIndex`
 * mutable, et un futur `.test()`/`.exec()` casserait l'autre appelant.
 */
export function createWikiLinkRegex(): RegExp {
  return /\[\[([^[\]|\n]+)(?:\|([^[\]\n]+))?\]\]/g;
}

const INLINE_CODE_REGEX = /`+[^`\n]*`+/g;
const NOTE_NUMBER_TARGET_REGEX = /^#(\d+)$/;

export type WikiLinkResolution =
  | {
      status: "resolved";
      noteId: string;
      title: string;
      /** Cible telle qu'écrite : `#42` est insensible au renommage, pas un titre. */
      target: string;
      ambiguous: boolean;
    }
  | { status: "self"; title: string; target: string }
  | { status: "broken"; target: string };

export interface NoteLinkIndex {
  byTitle: Map<string, Note[]>;
  byNumber: Map<number, Note>;
  titleById: Map<string, string>;
  /** Liens sortants résolus, par id de note source. */
  outgoing: Map<string, WikiLinkResolution[]>;
  /** Ids des notes qui pointent vers une note donnée. */
  backlinks: Map<string, string[]>;
}

/**
 * Cibles des `[[...]]` d'un contenu, hors blocs de code et code inline —
 * les mêmes exclusions que le rendu markdown, qui ne visite que les nœuds texte.
 */
export function extractWikiLinkTargets(content: string): string[] {
  const scannable = stripCodeBlocks(content ?? "").replace(
    INLINE_CODE_REGEX,
    "",
  );

  return [...scannable.matchAll(createWikiLinkRegex())].map((match) =>
    match[1].trim(),
  );
}

/** Ordre de création : le numéro de note est plus fin que la date (jour). */
function byCreationOrder(a: Note, b: Note): number {
  if (a.noteNumber > 0 && b.noteNumber > 0) return a.noteNumber - b.noteNumber;
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

export function buildNoteLinkIndex(notes: Note[]): NoteLinkIndex {
  const byTitle = new Map<string, Note[]>();
  const byNumber = new Map<number, Note>();
  const titleById = new Map<string, string>();

  for (const note of notes) {
    const title = deriveNoteTitle(note);
    titleById.set(note.id, title);

    const key = titleKey(title);
    const group = byTitle.get(key);
    if (group) group.push(note);
    else byTitle.set(key, [note]);

    if (note.noteNumber > 0) byNumber.set(note.noteNumber, note);
  }

  // Le plus ancien gagne en cas de titres identiques : une note nouvellement
  // créée ne doit jamais détourner les liens existants.
  for (const group of byTitle.values()) group.sort(byCreationOrder);

  const index: NoteLinkIndex = {
    byTitle,
    byNumber,
    titleById,
    outgoing: new Map(),
    backlinks: new Map(),
  };

  for (const note of notes) {
    const resolutions = extractWikiLinkTargets(note.content).map((target) =>
      resolveWikiLink(index, target, note.id),
    );
    index.outgoing.set(note.id, resolutions);

    for (const resolution of resolutions) {
      if (resolution.status !== "resolved") continue;

      const sources = index.backlinks.get(resolution.noteId);
      if (!sources) index.backlinks.set(resolution.noteId, [note.id]);
      else if (!sources.includes(note.id)) sources.push(note.id);
    }
  }

  return index;
}

export function resolveWikiLink(
  index: NoteLinkIndex,
  target: string,
  currentNoteId?: string,
): WikiLinkResolution {
  const trimmed = target.trim();
  if (!trimmed) return { status: "broken", target };

  const numeric = NOTE_NUMBER_TARGET_REGEX.exec(trimmed);
  const group = numeric ? undefined : index.byTitle.get(titleKey(trimmed));
  const match = numeric ? index.byNumber.get(Number(numeric[1])) : group?.[0];

  if (!match) return { status: "broken", target: trimmed };

  const title = index.titleById.get(match.id) ?? trimmed;

  if (match.id === currentNoteId)
    return { status: "self", title, target: trimmed };

  return {
    status: "resolved",
    noteId: match.id,
    title,
    target: trimmed,
    ambiguous: (group?.length ?? 0) > 1,
  };
}

/**
 * Notes qui pointent vers `noteId` **par son titre** — celles qui utilisent
 * `[[#42]]` survivent au renommage et ne doivent pas déclencher d'alerte.
 */
export function backlinksBrokenByRename(
  index: NoteLinkIndex,
  noteId: string,
  currentTitle: string,
): string[] {
  const key = titleKey(currentTitle);

  return (index.backlinks.get(noteId) ?? []).filter((sourceId) =>
    (index.outgoing.get(sourceId) ?? []).some(
      (link) =>
        link.status === "resolved" &&
        link.noteId === noteId &&
        titleKey(link.target) === key,
    ),
  );
}

/** Nombre de notes distinctes reliées (entrantes ∪ sortantes), pour la carte. */
export function countResolvedLinks(
  index: NoteLinkIndex,
  noteId: string,
): number {
  const targets = new Set(
    (index.outgoing.get(noteId) ?? []).flatMap((link) =>
      link.status === "resolved" ? [link.noteId] : [],
    ),
  );

  for (const sourceId of index.backlinks.get(noteId) ?? []) targets.add(sourceId);

  return targets.size;
}
