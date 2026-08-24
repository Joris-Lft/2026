import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGraphColors } from "@/hooks/use-graph-colors";
import { useGraphLayout } from "@/hooks/use-graph-layout";
import type { PositionedNode } from "@/hooks/use-graph-layout";
import type { NoteGraph as NoteGraphModel } from "@/utils/note-graph";
import { buildAdjacency } from "@/utils/note-graph";
import { createFrameScheduler } from "@/utils/frame-scheduler";
import styles from "./NoteGraph.module.css";

interface NoteGraphProps {
  graph: NoteGraphModel;
  onSelectNote: (noteId: string) => void;
  onSelectTag: (tag: string) => void;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 4;
/** Déplacement en pixels au-delà duquel un appui devient un pan, pas un clic. */
const CLICK_TOLERANCE = 4;

/** Délégation : un seul jeu de handlers plutôt qu'un par nœud. */
function nodeIdFromTarget(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  return target.closest("[data-node-id]")?.getAttribute("data-node-id") ?? null;
}

export function NoteGraph({
  graph,
  onSelectNote,
  onSelectTag,
}: NoteGraphProps) {
  const colors = useGraphColors();
  const layout = useGraphLayout(graph);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const view = useRef({ x: 0, y: 0, k: 1 });
  const [frames] = useState(createFrameScheduler);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);
  const pressRef = useRef<{
    nodeId: string | null;
    x: number;
    y: number;
  } | null>(null);

  const adjacency = useMemo(() => buildAdjacency(graph.links), [graph.links]);

  /**
   * Coordonnées écran → espace utilisateur du SVG. Le `transform` du `<g>`
   * s'exprime en unités viewBox, pas en pixels : sans cette conversion, le pan
   * et l'ancrage du zoom seraient décalés dès que le viewBox n'est pas à
   * l'échelle 1:1 avec le conteneur.
   */
  const toUserSpace = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return { x: clientX, y: clientY };

    const point = new DOMPoint(clientX, clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: point.x, y: point.y };
  }, []);

  /**
   * Le transform est écrit directement sur le `<g>` : pendant un pan ou un
   * zoom, React ne re-rend rien.
   */
  const applyTransform = useCallback(() => {
    frames.schedule(() => {
      const { x, y, k } = view.current;
      viewportRef.current?.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(${k})`,
      );
    });
  }, [frames]);

  const resetView = useCallback(() => {
    view.current = { x: 0, y: 0, k: 1 };
    applyTransform();
  }, [applyTransform]);

  // Une nouvelle disposition repart d'une vue recadrée.
  useEffect(() => {
    resetView();
  }, [layout, resetView]);

  useEffect(() => () => frames.cancel(), [frames]);

  const zoomAt = useCallback(
    (factor: number, originX: number, originY: number) => {
      const { x, y, k } = view.current;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, k * factor));
      if (next === k) return;

      view.current = {
        k: next,
        x: originX - ((originX - x) * next) / k,
        y: originY - ((originY - y) * next) / k,
      };
      applyTransform();
    },
    [applyTransform],
  );

  // Écouteur non passif : sinon preventDefault est ignoré et la modale scrolle.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const origin = toUserSpace(event.clientX, event.clientY);
      zoomAt(Math.exp(-event.deltaY * 0.0015), origin.x, origin.y);
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toUserSpace, zoomAt]);

  /** Zoom des boutons : ancré au centre visible. */
  const zoomFromCenter = useCallback(
    (factor: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      const origin = rect
        ? toUserSpace(rect.left + rect.width / 2, rect.top + rect.height / 2)
        : { x: 0, y: 0 };
      zoomAt(factor, origin.x, origin.y);
    },
    [toUserSpace, zoomAt],
  );

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;

    // La cible est mémorisée ici : la capture de pointeur peut recibler le
    // `click` sur le <svg>, on ne peut donc pas s'y fier pour retrouver le nœud.
    pressRef.current = {
      nodeId: nodeIdFromTarget(event.target),
      x: event.clientX,
      y: event.clientY,
    };

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [...pointers.current.values()];

    if (points.length >= 2) {
      // Un pincement n'est jamais un clic.
      pressRef.current = null;
      const [a, b] = points;
      const distance = Math.hypot(a.x - b.x, a.y - b.y);

      if (pinchDistance.current !== null && pinchDistance.current > 0) {
        const origin = toUserSpace((a.x + b.x) / 2, (a.y + b.y) / 2);
        zoomAt(distance / pinchDistance.current, origin.x, origin.y);
      }
      pinchDistance.current = distance;
      return;
    }

    const from = toUserSpace(previous.x, previous.y);
    const to = toUserSpace(event.clientX, event.clientY);

    view.current = {
      ...view.current,
      x: view.current.x + (to.x - from.x),
      y: view.current.y + (to.y - from.y),
    };
    applyTransform();
  };

  const handlePointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchDistance.current = null;

    const press = pressRef.current;
    pressRef.current = null;
    if (!press?.nodeId) return;

    // Un déplacement au-delà du seuil est un pan, pas un clic : sans ça, tout
    // pan démarré sur un nœud ouvrirait ce nœud au relâchement.
    const moved = Math.hypot(
      event.clientX - press.x,
      event.clientY - press.y,
    );
    if (moved > CLICK_TOLERANCE) return;

    const node = layout.nodes.find((candidate) => candidate.id === press.nodeId);
    if (!node) return;

    if (node.kind === "note" && node.noteId) onSelectNote(node.noteId);
    else if (node.kind === "tag" && node.tag) onSelectTag(node.tag);
  };

  const handlePointerCancel = (event: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchDistance.current = null;
    pressRef.current = null;
  };

  const isDimmed = (id: string) =>
    hoveredId !== null &&
    id !== hoveredId &&
    !adjacency.get(hoveredId)?.has(id);

  const { viewBox } = layout;
  const ariaLabel = `Graphe de ${graph.noteCount} note${graph.noteCount > 1 ? "s" : ""} et ${graph.tagCount} tag${graph.tagCount > 1 ? "s" : ""}, ${graph.links.length} lien${graph.links.length > 1 ? "s" : ""}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => zoomFromCenter(1.25)}
          aria-label="Zoomer"
        >
          <Plus size={16} aria-hidden />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => zoomFromCenter(0.8)}
          aria-label="Dézoomer"
        >
          <Minus size={16} aria-hidden />
        </Button>
        <Button size="sm" variant="ghost" onClick={resetView}>
          <Maximize2 size={14} aria-hidden /> Recentrer
        </Button>
      </div>

      <div className={styles.canvasBox}>
        <svg
          ref={svgRef}
          className={styles.canvas}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          role="img"
          aria-label={ariaLabel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onLostPointerCapture={handlePointerCancel}
        >
          <g ref={viewportRef}>
            <g>
              {layout.links.map((link) => {
                const dimmed =
                  hoveredId !== null &&
                  link.source.id !== hoveredId &&
                  link.target.id !== hoveredId;

                return (
                  <line
                    key={`${link.source.id}>${link.target.id}`}
                    className={
                      dimmed ? `${styles.edge} ${styles.dimmed}` : styles.edge
                    }
                    x1={link.source.x}
                    y1={link.source.y}
                    x2={link.target.x}
                    y2={link.target.y}
                    stroke={
                      hoveredId !== null && !dimmed
                        ? colors.edgeActive
                        : colors.edge
                    }
                    strokeWidth={link.kind === "tag" ? 0.7 : 1.2}
                  />
                );
              })}
            </g>

            <g
              onPointerOver={(event) => setHoveredId(nodeIdFromTarget(event.target))}
              onPointerOut={() => setHoveredId(null)}
            >
              {layout.nodes.map((node) => (
                <GraphNodeMark
                  key={node.id}
                  node={node}
                  colors={colors}
                  dimmed={isDimmed(node.id)}
                />
              ))}
            </g>
          </g>
        </svg>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span
            className={styles.legendSwatch}
            style={{ background: colors.noteFill }}
            aria-hidden
          />
          Note
        </span>
        <span className={styles.legendItem}>
          <span
            className={`${styles.legendSwatch} ${styles.legendSwatchTag}`}
            style={{ background: colors.tagFill }}
            aria-hidden
          />
          Tag
        </span>
      </div>
    </div>
  );
}

function GraphNodeMark({
  node,
  colors,
  dimmed,
}: {
  node: PositionedNode;
  colors: ReturnType<typeof useGraphColors>;
  dimmed: boolean;
}) {
  const isTag = node.kind === "tag";
  const fill = isTag ? colors.tagFill : colors.noteFill;
  const stroke = isTag ? colors.tagStroke : colors.noteStroke;
  const label = truncate(node.label, 24);

  return (
    <g
      className={
        dimmed ? `${styles.nodeGroup} ${styles.dimmed}` : styles.nodeGroup
      }
      data-node-id={node.id}
    >
      {/* Le label est tronqué, voire masqué pour les nœuds isolés : sans ce
          <title>, ils sont des pastilles anonymes mais cliquables. */}
      <title>{isTag ? `#${node.label}` : node.label}</title>

      {/* Deux formes distinctes : la couleur seule ne doit pas porter l'info. */}
      {isTag ? (
        <rect
          className={styles.node}
          x={-node.radius}
          y={-node.radius}
          width={node.radius * 2}
          height={node.radius * 2}
          rx={2}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
          transform={`translate(${node.x} ${node.y}) rotate(45)`}
        />
      ) : (
        <circle
          className={styles.node}
          cx={node.x}
          cy={node.y}
          r={node.radius}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
        />
      )}

      {(node.degree > 0 || isTag) && label && (
        <text
          className={styles.label}
          x={node.x}
          y={node.y + node.radius + 8}
          textAnchor="middle"
          fill={isTag ? colors.labelMuted : colors.label}
        >
          {isTag ? `#${label}` : label}
        </text>
      )}
    </g>
  );
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
