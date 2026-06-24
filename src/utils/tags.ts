import type { Note } from "@/types/notes";

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export function collectUniqueTags(notes: Note[]): string[] {
  const tags = new Set<string>();

  for (const note of notes) {
    for (const tag of note.tags) {
      const normalized = normalizeTag(tag);
      if (normalized) tags.add(normalized);
    }
  }

  return [...tags].sort((a, b) => a.localeCompare(b, "fr"));
}

export function filterNotesByTags(notes: Note[], selectedTags: string[]): Note[] {
  if (selectedTags.length === 0) return notes;

  const selected = new Set(selectedTags.map((tag) => tag.toLowerCase()));

  return notes.filter((note) =>
    note.tags.some((tag) => selected.has(tag.toLowerCase())),
  );
}
