import { beforeEach, describe, expect, it } from "vitest";
import { makeNote, resetNoteSequence } from "@/test/factories";
import { collectUniqueTags, filterNotesByTags } from "./tags";

beforeEach(resetNoteSequence);

describe("collectUniqueTags", () => {
  it("rassemble les tags de toutes les notes, triés en français", () => {
    const notes = [
      makeNote({ tags: ["voyage", "élan"] }),
      makeNote({ tags: ["cuisine"] }),
    ];

    expect(collectUniqueTags(notes)).toEqual(["cuisine", "élan", "voyage"]);
  });

  it("dédoublonne à la casse près", () => {
    const notes = [makeNote({ tags: ["Maison"] }), makeNote({ tags: ["maison"] })];
    expect(collectUniqueTags(notes)).toEqual(["Maison"]);
  });

  it("renvoie une liste vide sans note", () => {
    expect(collectUniqueTags([])).toEqual([]);
  });
});

describe("filterNotesByTags", () => {
  it("renvoie toutes les notes quand aucun tag n'est sélectionné", () => {
    const notes = [makeNote({ tags: ["a"] }), makeNote()];
    expect(filterNotesByTags(notes, [])).toEqual(notes);
  });

  it("garde les notes portant au moins un des tags (union, pas intersection)", () => {
    const cuisine = makeNote({ tags: ["cuisine"] });
    const voyage = makeNote({ tags: ["voyage"] });
    const autre = makeNote({ tags: ["sport"] });

    const result = filterNotesByTags([cuisine, voyage, autre], [
      "cuisine",
      "voyage",
    ]);

    expect(result.map((note) => note.id)).toEqual([cuisine.id, voyage.id]);
  });

  it("compare sans tenir compte de la casse", () => {
    const note = makeNote({ tags: ["Maison"] });
    expect(filterNotesByTags([note], ["maison"])).toEqual([note]);
  });

  it("renvoie une liste vide quand aucun tag ne correspond", () => {
    expect(filterNotesByTags([makeNote({ tags: ["a"] })], ["b"])).toEqual([]);
  });
});
