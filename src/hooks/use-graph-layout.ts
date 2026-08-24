import { useMemo } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import type { GraphNode, NoteGraph } from "@/utils/note-graph";
import { buildGraphSignature } from "@/utils/note-graph";

export interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export interface PositionedLink {
  source: PositionedNode;
  target: PositionedNode;
  kind: GraphNode["kind"];
}

export interface GraphLayout {
  nodes: PositionedNode[];
  links: PositionedLink[];
  /** Boîte englobante, marge comprise. */
  viewBox: { x: number; y: number; width: number; height: number };
}

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & { kind: GraphNode["kind"] };

const PADDING = 40;

/**
 * Calcule la disposition une seule fois, en synchrone, puis la fige : le SVG est
 * rendu une fois et le pan/zoom n'agit ensuite que sur un `transform`.
 */
export function useGraphLayout(graph: NoteGraph): GraphLayout {
  // Mémoïsée : sinon la signature (une longue chaîne) est reconstruite à
  // chaque rendu, donc à chaque survol de nœud.
  const signature = useMemo(() => buildGraphSignature(graph), [graph]);

  return useMemo(() => {
    if (graph.nodes.length === 0) {
      return {
        nodes: [],
        links: [],
        viewBox: { x: 0, y: 0, width: 100, height: 100 },
      };
    }

    // forceLink mute les liens (remplace les ids par des références) : on
    // travaille toujours sur des copies fraîches.
    const simNodes: SimNode[] = graph.nodes.map((node) => ({ ...node }));
    const simLinks: SimLink[] = graph.links.map((link) => ({
      source: link.source,
      target: link.target,
      kind: link.kind,
    }));

    const simulation = forceSimulation(simNodes)
      .force("charge", forceManyBody<SimNode>().strength(-170).distanceMax(420))
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((node) => node.id)
          .distance((link) => (link.kind === "tag" ? 55 : 95))
          .strength(0.35),
      )
      .force("collide", forceCollide<SimNode>().radius((node) => node.radius + 5))
      // forceX/forceY plutôt que forceCenter : empêche aussi les composantes
      // déconnectées de dériver indéfiniment.
      .force("x", forceX<SimNode>(0).strength(0.05))
      .force("y", forceY<SimNode>(0).strength(0.05))
      .stop();

    const ticks = Math.ceil(
      Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()),
    );
    for (let i = 0; i < ticks; i += 1) simulation.tick();

    const nodes: PositionedNode[] = simNodes.map((node) => ({
      ...(node as GraphNode),
      x: node.x ?? 0,
      y: node.y ?? 0,
    }));
    const positionedById = new Map(nodes.map((node) => [node.id, node]));

    const links: PositionedLink[] = graph.links.flatMap((link) => {
      const source = positionedById.get(link.source);
      const target = positionedById.get(link.target);
      return source && target ? [{ source, target, kind: link.kind }] : [];
    });

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.x - node.radius);
      minY = Math.min(minY, node.y - node.radius);
      maxX = Math.max(maxX, node.x + node.radius);
      maxY = Math.max(maxY, node.y + node.radius);
    }

    return {
      nodes,
      links,
      viewBox: {
        x: minX - PADDING,
        y: minY - PADDING,
        width: Math.max(1, maxX - minX + PADDING * 2),
        height: Math.max(1, maxY - minY + PADDING * 2),
      },
    };
    // La signature capture nœuds et arêtes : même graphe ⇒ même disposition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
}
