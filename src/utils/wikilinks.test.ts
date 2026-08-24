import { beforeEach, describe, expect, it } from "vitest";
import { makeNote, resetNoteSequence } from "@/test/factories";
import {
  backlinksBrokenByRename,
  buildNoteLinkIndex,
  countResolvedLinks,
  createWikiLinkRegex,
  extractWikiLinkTargets,
  resolveWikiLink,
} from "./wikilinks";

beforeEach(resetNoteSequence);

describe("createWikiLinkRegex", () => {
  it("renvoie une instance neuve à chaque appel", () => {
    // Une regex /g partagée porte un lastIndex mutable : deux appelants
    // se marcheraient dessus.
    const first = createWikiLinkRegex();
    first.exec("[[A]] [[B]]");
    expect(first.lastIndex).toBeGreaterThan(0);
    expect(createWikiLinkRegex().lastIndex).toBe(0);
  });
});

describe("extractWikiLinkTargets", () => {
  it("extrait les cibles simples et à libellé", () => {
    expect(extractWikiLinkTargets("Voir [[A]] et [[B|libellé]]")).toEqual([
      "A",
      "B",
    ]);
  });

  it("extrait une cible numérique", () => {
    expect(extractWikiLinkTargets("Voir [[#42]]")).toEqual(["#42"]);
  });

  it("ignore le code inline", () => {
    expect(extractWikiLinkTargets("`[[A]]` puis [[B]]")).toEqual(["B"]);
  });

  it("ignore un bloc de code délimité", () => {
    expect(extractWikiLinkTargets("```\n[[A]]\n```\n[[B]]")).toEqual(["B"]);
  });

  it("ignore un bloc de code indenté", () => {
    // Le rendu markdown en fait un <pre> : l'index doit s'aligner dessus,
    // sinon la pastille de liens et les backlinks comptent des liens fantômes.
    expect(extractWikiLinkTargets("texte\n\n    [[A]]\n\n[[B]]")).toEqual(["B"]);
  });

  it("ignore les crochets vides", () => {
    expect(extractWikiLinkTargets("[[]] et [[A]]")).toEqual(["A"]);
  });

  it("nettoie les espaces autour de la cible", () => {
    expect(extractWikiLinkTargets("[[  A  ]]")).toEqual(["A"]);
  });

  it("ne capture pas une cible contenant un crochet", () => {
    expect(extractWikiLinkTargets("[[A[B]]")).toEqual([]);
  });

  it("renvoie une liste vide sur un contenu vide", () => {
    expect(extractWikiLinkTargets("")).toEqual([]);
  });
});

describe("buildNoteLinkIndex", () => {
  it("indexe les titres dérivés et les numéros", () => {
    const note = makeNote({ content: "# Recettes", noteNumber: 4 });
    const index = buildNoteLinkIndex([note]);

    expect(index.titleById.get(note.id)).toBe("Recettes");
    expect(index.byNumber.get(4)?.id).toBe(note.id);
  });

  it("enregistre les backlinks sans doublon", () => {
    const cible = makeNote({ content: "# Cible" });
    const source = makeNote({ content: "voir [[Cible]] puis [[Cible]]" });

    const index = buildNoteLinkIndex([cible, source]);

    expect(index.backlinks.get(cible.id)).toEqual([source.id]);
  });

  it("ne compte pas un auto-lien comme backlink", () => {
    const note = makeNote({ content: "# Boucle\nvoir [[Boucle]]" });
    const index = buildNoteLinkIndex([note]);

    expect(index.backlinks.has(note.id)).toBe(false);
    expect(index.outgoing.get(note.id)?.[0].status).toBe("self");
  });

  it("conserve une résolution par occurrence de lien", () => {
    const cible = makeNote({ content: "# Cible" });
    const source = makeNote({ content: "[[Cible]] et [[cible]]" });

    const index = buildNoteLinkIndex([cible, source]);

    expect(index.outgoing.get(source.id)).toHaveLength(2);
  });
});

describe("resolveWikiLink", () => {
  const build = () => {
    const recettes = makeNote({ content: "# Recettes", noteNumber: 1 });
    const courses = makeNote({ content: "# Courses", noteNumber: 2 });
    return { recettes, courses, index: buildNoteLinkIndex([recettes, courses]) };
  };

  it("résout par titre", () => {
    const { courses, index } = build();
    expect(resolveWikiLink(index, "Courses")).toMatchObject({
      status: "resolved",
      noteId: courses.id,
      title: "Courses",
      target: "Courses",
      ambiguous: false,
    });
  });

  it("résout sans tenir compte de la casse ni des espaces", () => {
    const { courses, index } = build();
    expect(resolveWikiLink(index, "  cOuRsEs  ")).toMatchObject({
      status: "resolved",
      noteId: courses.id,
    });
  });

  it("résout par numéro de note", () => {
    const { recettes, index } = build();
    expect(resolveWikiLink(index, "#1")).toMatchObject({
      status: "resolved",
      noteId: recettes.id,
      title: "Recettes",
      target: "#1",
    });
  });

  it("signale une cible introuvable", () => {
    const { index } = build();
    expect(resolveWikiLink(index, "Inexistant")).toEqual({
      status: "broken",
      target: "Inexistant",
    });
  });

  it("signale un numéro de note inexistant", () => {
    const { index } = build();
    expect(resolveWikiLink(index, "#999").status).toBe("broken");
  });

  it("signale un lien vers la note courante", () => {
    const { courses, index } = build();
    expect(resolveWikiLink(index, "Courses", courses.id)).toEqual({
      status: "self",
      title: "Courses",
      target: "Courses",
    });
  });

  it("traite une cible vide comme cassée", () => {
    const { index } = build();
    expect(resolveWikiLink(index, "   ").status).toBe("broken");
  });

  describe("titres en collision", () => {
    it("résout vers la note la plus ancienne et signale l'ambiguïté", () => {
      // La plus récente ne doit jamais détourner les liens existants.
      const ancienne = makeNote({ content: "# Doublon", noteNumber: 1 });
      const recente = makeNote({ content: "# Doublon", noteNumber: 2 });
      const index = buildNoteLinkIndex([recente, ancienne]);

      expect(resolveWikiLink(index, "Doublon")).toMatchObject({
        noteId: ancienne.id,
        ambiguous: true,
      });
    });

    it("ne marque pas ambiguë une cible numérique", () => {
      const ancienne = makeNote({ content: "# Doublon", noteNumber: 1 });
      const recente = makeNote({ content: "# Doublon", noteNumber: 2 });
      const index = buildNoteLinkIndex([ancienne, recente]);

      expect(resolveWikiLink(index, "#2")).toMatchObject({
        noteId: recente.id,
        ambiguous: false,
      });
    });
  });
});

describe("backlinksBrokenByRename", () => {
  it("ne retient que les sources qui pointent par titre", () => {
    // `[[#1]]` survit au renommage : prétendre le contraire viderait
    // l'avertissement de sa valeur.
    const cible = makeNote({ content: "# Recettes", noteNumber: 1 });
    const parTitre = makeNote({ content: "voir [[Recettes]]" });
    const parNumero = makeNote({ content: "voir [[#1]]" });
    const index = buildNoteLinkIndex([cible, parTitre, parNumero]);

    expect(index.backlinks.get(cible.id)).toEqual([parTitre.id, parNumero.id]);
    expect(backlinksBrokenByRename(index, cible.id, "Recettes")).toEqual([
      parTitre.id,
    ]);
  });

  it("renvoie une liste vide sans backlink", () => {
    const note = makeNote({ content: "# Seule" });
    const index = buildNoteLinkIndex([note]);

    expect(backlinksBrokenByRename(index, note.id, "Seule")).toEqual([]);
  });
});

describe("countResolvedLinks", () => {
  it("compte les notes reliées dans les deux sens, sans doublon", () => {
    const a = makeNote({ content: "# A\nvoir [[B]] et [[B]]" });
    const b = makeNote({ content: "# B\nvoir [[A]]" });
    const c = makeNote({ content: "# C\nvoir [[A]]" });
    const index = buildNoteLinkIndex([a, b, c]);

    expect(countResolvedLinks(index, a.id)).toBe(2);
    expect(countResolvedLinks(index, b.id)).toBe(1);
  });

  it("ignore les liens cassés", () => {
    const a = makeNote({ content: "# A\nvoir [[Inexistant]]" });
    const index = buildNoteLinkIndex([a]);

    expect(countResolvedLinks(index, a.id)).toBe(0);
  });
});
