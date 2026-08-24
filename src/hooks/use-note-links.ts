import { useCallback, useMemo } from "react";
import type { Note } from "@/types/notes";
import type { NoteLinkIndex, WikiLinkResolution } from "@/utils/wikilinks";
import { buildNoteLinkIndex, resolveWikiLink } from "@/utils/wikilinks";

export interface NoteLinkCandidate {
  id: string;
  title: string;
  noteNumber: number;
}

export interface NoteLinks {
  index: NoteLinkIndex;
  /** Notes triées par titre, pour l'autocomplétion. */
  candidates: NoteLinkCandidate[];
  resolve: (target: string, currentNoteId?: string) => WikiLinkResolution;
  backlinksOf: (noteId: string) => NoteLinkCandidate[];
  titleOf: (noteId: string) => string;
}

export function useNoteLinks(notes: Note[]): NoteLinks {
  const index = useMemo(() => buildNoteLinkIndex(notes), [notes]);

  const candidates = useMemo(
    () =>
      notes
        .map((note) => ({
          id: note.id,
          title: index.titleById.get(note.id) ?? "",
          noteNumber: note.noteNumber,
        }))
        .sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [notes, index],
  );

  const resolve = useCallback(
    (target: string, currentNoteId?: string) =>
      resolveWikiLink(index, target, currentNoteId),
    [index],
  );

  const backlinksOf = useCallback(
    (noteId: string) =>
      (index.backlinks.get(noteId) ?? []).flatMap((sourceId) => {
        const source = candidates.find((candidate) => candidate.id === sourceId);
        return source ? [source] : [];
      }),
    [index, candidates],
  );

  const titleOf = useCallback(
    (noteId: string) => index.titleById.get(noteId) ?? "",
    [index],
  );

  return { index, candidates, resolve, backlinksOf, titleOf };
}
