import type { Note } from "@/types/notes";
import { titleKey } from "./notes";
import { resolveOptionLabel } from "./options";
import { collectUniqueTags } from "./tags";
import type { NoteLinkIndex } from "./wikilinks";

export type GraphNodeKind = "note" | "tag";

export interface GraphNode {
  id: string;
  kind: GraphNodeKind;
  label: string;
  /** Renseigné pour les nœuds de note. */
  noteId?: string;
  /** Renseigné pour les nœuds de tag (casse d'origine). */
  tag?: string;
  degree: number;
  radius: number;
}

export interface GraphLink {
  source: string;
  target: string;
  kind: GraphNodeKind;
}

export interface NoteGraph {
  nodes: GraphNode[];
  links: GraphLink[];
  noteCount: number;
  tagCount: number;
}

const noteNodeId = (noteId: string) => `note:${noteId}`;
const tagNodeId = (tag: string) => `tag:${titleKey(tag)}`;

export function buildNoteGraph(
  notes: Note[],
  index: NoteLinkIndex,
): NoteGraph {
  const nodes = new Map<string, GraphNode>();
  const links: GraphLink[] = [];
  const seenLinks = new Set<string>();

  const tagLabels = collectUniqueTags(notes);

  for (const note of notes) {
    nodes.set(noteNodeId(note.id), {
      id: noteNodeId(note.id),
      kind: "note",
      label: index.titleById.get(note.id) ?? "",
      noteId: note.id,
      degree: 0,
      radius: 0,
    });
  }

  for (const tag of tagLabels) {
    nodes.set(tagNodeId(tag), {
      id: tagNodeId(tag),
      kind: "tag",
      label: tag,
      tag,
      degree: 0,
      radius: 0,
    });
  }

  /** Les liens note↔note sont non orientés : a→b et b→a sont une seule arête. */
  const addLink = (a: string, b: string, kind: GraphNodeKind) => {
    if (a === b) return;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (seenLinks.has(key)) return;
    seenLinks.add(key);
    links.push({ source: a, target: b, kind });
  };

  for (const note of notes) {
    const from = noteNodeId(note.id);

    for (const link of index.outgoing.get(note.id) ?? []) {
      if (link.status !== "resolved") continue;
      addLink(from, noteNodeId(link.noteId), "note");
    }

    for (const tag of note.tags) {
      const label = resolveOptionLabel(tagLabels, tag);
      if (!label) continue;
      addLink(from, tagNodeId(label), "tag");
    }
  }

  for (const link of links) {
    const source = nodes.get(link.source);
    const target = nodes.get(link.target);
    if (source) source.degree += 1;
    if (target) target.degree += 1;
  }

  for (const node of nodes.values()) {
    node.radius = Math.min(14, Math.max(4, 4 + Math.sqrt(node.degree) * 2.5));
  }

  const allNodes = [...nodes.values()];

  return {
    nodes: allNodes,
    links,
    noteCount: allNodes.filter((node) => node.kind === "note").length,
    tagCount: allNodes.filter((node) => node.kind === "tag").length,
  };
}

/** Retire les nœuds sans aucune arête (et les tags devenus orphelins). */
export function withoutIsolatedNodes(graph: NoteGraph): NoteGraph {
  const connected = new Set<string>();
  for (const link of graph.links) {
    connected.add(link.source);
    connected.add(link.target);
  }

  const nodes = graph.nodes.filter((node) => connected.has(node.id));

  return {
    nodes,
    links: graph.links,
    noteCount: nodes.filter((node) => node.kind === "note").length,
    tagCount: nodes.filter((node) => node.kind === "tag").length,
  };
}

/** Voisins directs de chaque nœud, pour la mise en avant au survol. */
export function buildAdjacency(links: GraphLink[]): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  const connect = (a: string, b: string) => {
    const neighbours = adjacency.get(a);
    if (neighbours) neighbours.add(b);
    else adjacency.set(a, new Set([b]));
  };

  for (const link of links) {
    connect(link.source, link.target);
    connect(link.target, link.source);
  }

  return adjacency;
}

/** Signature stable du graphe, utilisée comme clé de mémoïsation du layout. */
export function buildGraphSignature(graph: NoteGraph): string {
  return `${graph.nodes.map((node) => node.id).join(",")}#${graph.links
    .map((link) => `${link.source}>${link.target}`)
    .join(",")}`;
}
