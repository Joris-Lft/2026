import { beforeEach, describe, expect, it } from "vitest";
import { makeNote, resetNoteSequence } from "@/test/factories";
import {
  buildAdjacency,
  buildGraphSignature,
  buildNoteGraph,
  withoutIsolatedNodes,
} from "./note-graph";
import { buildNoteLinkIndex } from "./wikilinks";

beforeEach(resetNoteSequence);

/** Construit le graphe d'un jeu de notes, index compris. */
const graphOf = (notes: Parameters<typeof buildNoteLinkIndex>[0]) =>
  buildNoteGraph(notes, buildNoteLinkIndex(notes));

describe("buildNoteGraph", () => {
  it("crée un nœud par note et par tag", () => {
    const graph = graphOf([
      makeNote({ content: "# A", tags: ["cuisine"] }),
      makeNote({ content: "# B", tags: ["voyage"] }),
    ]);

    expect(graph.noteCount).toBe(2);
    expect(graph.tagCount).toBe(2);
    expect(graph.nodes).toHaveLength(4);
  });

  it("fusionne les tags qui ne diffèrent que par la casse", () => {
    const graph = graphOf([
      makeNote({ content: "# A", tags: ["Maison"] }),
      makeNote({ content: "# B", tags: ["maison"] }),
    ]);

    expect(graph.tagCount).toBe(1);
    expect(graph.links.filter((link) => link.kind === "tag")).toHaveLength(2);
  });

  it("relie deux notes liées par un wikilink", () => {
    const a = makeNote({ content: "# A\nvoir [[B]]" });
    const b = makeNote({ content: "# B" });
    const graph = graphOf([a, b]);

    expect(graph.links.filter((link) => link.kind === "note")).toEqual([
      { source: `note:${a.id}`, target: `note:${b.id}`, kind: "note" },
    ]);
  });

  it("dédoublonne une relation réciproque en une seule arête", () => {
    const graph = graphOf([
      makeNote({ content: "# A\nvoir [[B]]" }),
      makeNote({ content: "# B\nvoir [[A]]" }),
    ]);

    expect(graph.links.filter((link) => link.kind === "note")).toHaveLength(1);
  });

  it("ignore les liens cassés et les auto-liens", () => {
    const graph = graphOf([
      makeNote({ content: "# A\nvoir [[Inexistant]] et [[A]]" }),
    ]);

    expect(graph.links).toHaveLength(0);
  });

  it("calcule le degré et un rayon croissant borné", () => {
    const hub = makeNote({ content: "# Hub\nvoir [[Feuille]]", tags: ["t1", "t2"] });
    const feuille = makeNote({ content: "# Feuille" });
    const graph = graphOf([hub, feuille]);

    const hubNode = graph.nodes.find((node) => node.id === `note:${hub.id}`)!;
    const feuilleNode = graph.nodes.find(
      (node) => node.id === `note:${feuille.id}`,
    )!;

    expect(hubNode.degree).toBe(3);
    expect(feuilleNode.degree).toBe(1);
    expect(hubNode.radius).toBeGreaterThan(feuilleNode.radius);
    expect(hubNode.radius).toBeLessThanOrEqual(14);
    expect(feuilleNode.radius).toBeGreaterThanOrEqual(4);
  });

  it("donne le rayon minimal à une note isolée", () => {
    const graph = graphOf([makeNote({ content: "# Seule" })]);
    expect(graph.nodes[0]).toMatchObject({ degree: 0, radius: 4 });
  });

  it("renvoie un graphe vide sans note", () => {
    const graph = graphOf([]);
    expect(graph).toMatchObject({ nodes: [], links: [], noteCount: 0, tagCount: 0 });
  });
});

describe("withoutIsolatedNodes", () => {
  it("retire les nœuds sans arête et garde les autres", () => {
    const a = makeNote({ content: "# A\nvoir [[B]]" });
    const b = makeNote({ content: "# B" });
    const seule = makeNote({ content: "# Seule" });
    const filtered = withoutIsolatedNodes(graphOf([a, b, seule]));

    expect(filtered.nodes.map((node) => node.id)).toEqual([
      `note:${a.id}`,
      `note:${b.id}`,
    ]);
    expect(filtered.noteCount).toBe(2);
  });

  it("ne retire rien quand tout est relié", () => {
    const graph = graphOf([
      makeNote({ content: "# A", tags: ["t"] }),
      makeNote({ content: "# B", tags: ["t"] }),
    ]);

    expect(withoutIsolatedNodes(graph).nodes).toHaveLength(graph.nodes.length);
  });
});

describe("buildAdjacency", () => {
  it("relie les voisins dans les deux sens", () => {
    const a = makeNote({ content: "# A\nvoir [[B]]", tags: ["maison"] });
    const b = makeNote({ content: "# B" });
    const adjacency = buildAdjacency(graphOf([a, b]).links);

    expect([...adjacency.get(`note:${a.id}`)!].sort()).toEqual([
      `note:${b.id}`,
      "tag:maison",
    ]);
    expect([...adjacency.get("tag:maison")!]).toEqual([`note:${a.id}`]);
  });

  it("n'inscrit rien pour un nœud isolé", () => {
    const seule = makeNote({ content: "# Seule" });
    expect(buildAdjacency(graphOf([seule]).links).has(`note:${seule.id}`)).toBe(
      false,
    );
  });
});

describe("buildGraphSignature", () => {
  it("est stable pour un même graphe", () => {
    const notes = [makeNote({ content: "# A\nvoir [[B]]" }), makeNote({ content: "# B" })];
    expect(buildGraphSignature(graphOf(notes))).toBe(
      buildGraphSignature(graphOf(notes)),
    );
  });

  it("change quand une arête apparaît", () => {
    const sans = graphOf([makeNote({ content: "# A" }), makeNote({ content: "# B" })]);
    resetNoteSequence();
    const avec = graphOf([
      makeNote({ content: "# A\nvoir [[B]]" }),
      makeNote({ content: "# B" }),
    ]);

    expect(buildGraphSignature(sans)).not.toBe(buildGraphSignature(avec));
  });
});
