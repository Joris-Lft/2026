import type { Note } from "@/types/notes";
import { mergeOptions } from "./options";

export function collectUniqueTags(notes: Note[]): string[] {
  return mergeOptions(notes.flatMap((note) => note.tags)).sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
}

export function filterNotesByTags(notes: Note[], selectedTags: string[]): Note[] {
  if (selectedTags.length === 0) return notes;

  const selected = new Set(selectedTags.map((tag) => tag.toLowerCase()));

  return notes.filter((note) =>
    note.tags.some((tag) => selected.has(tag.toLowerCase())),
  );
}
