import type { Note } from "@/types/notes";

function sortByCreatedAt(notes: Note[]): Note[] {
  return [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function splitNotesByStatus(notes: Note[]): {
  perso: Note[];
  commune: Note[];
} {
  const sorted = sortByCreatedAt(notes);

  return {
    perso: sorted.filter((note) => note.status === "Perso"),
    commune: sorted.filter((note) => note.status === "Commune"),
  };
}
