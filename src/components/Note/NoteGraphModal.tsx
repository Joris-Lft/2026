import { Suspense, lazy, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Spinner } from "@/components/ui/Spinner";
import type { NoteLinks } from "@/hooks/use-note-links";
import type { Note } from "@/types/notes";
import { buildNoteGraph, withoutIsolatedNodes } from "@/utils/note-graph";
import { resolveOptionLabel } from "@/utils/options";
import { collectUniqueTags } from "@/utils/tags";
import styles from "./NoteGraphModal.module.css";

// d3-force part dans un chunk séparé : il n'est chargé qu'à l'ouverture.
const NoteGraph = lazy(() =>
  import("./NoteGraph").then((module) => ({ default: module.NoteGraph })),
);

type GraphView = "graph" | "list";

interface NoteGraphModalProps {
  notes: Note[];
  links: NoteLinks;
  onSelectNote: (noteId: string) => void;
  onSelectTag: (tag: string) => void;
  onClose: () => void;
}

export function NoteGraphModal({
  notes,
  links,
  onSelectNote,
  onSelectTag,
  onClose,
}: NoteGraphModalProps) {
  const [view, setView] = useState<GraphView>("graph");
  const [hideIsolated, setHideIsolated] = useState(false);

  const fullGraph = useMemo(
    () => buildNoteGraph(notes, links.index),
    [notes, links.index],
  );
  const graph = useMemo(
    () => (hideIsolated ? withoutIsolatedNodes(fullGraph) : fullGraph),
    [fullGraph, hideIsolated],
  );

  return (
    <Modal
      open
      portal
      variant="drawer"
      maxWidth={1000}
      title="Graphe des notes"
      titleId="note-graph-title"
      onClose={onClose}
    >
      <div className={styles.body}>
        <div className={styles.toolbar}>
          <SegmentedControl
            value={view}
            options={[
              { value: "graph", label: "Graphe" },
              { value: "list", label: "Liste" },
            ]}
            onChange={setView}
            ariaLabel="Mode d'affichage"
          />
          {view === "graph" && (
            <Checkbox
              checked={hideIsolated}
              onChange={setHideIsolated}
              label="Masquer les notes isolées"
            />
          )}
        </div>

        {graph.nodes.length === 0 ? (
          <EmptyState>
            {notes.length === 0
              ? "Aucune note pour le moment"
              : "Aucune note reliée — ajoutez des tags ou des liens [[...]]"}
          </EmptyState>
        ) : view === "graph" ? (
          <Suspense
            fallback={
              <div className={styles.loading}>
                <Spinner />
              </div>
            }
          >
            <NoteGraph
              graph={graph}
              onSelectNote={onSelectNote}
              onSelectTag={onSelectTag}
            />
          </Suspense>
        ) : (
          <NoteRelationList
            notes={notes}
            links={links}
            onSelectNote={onSelectNote}
            onSelectTag={onSelectTag}
          />
        )}
      </div>
    </Modal>
  );
}

/** Repli textuel du graphe : mêmes relations, navigables au clavier. */
function NoteRelationList({
  notes,
  links,
  onSelectNote,
  onSelectTag,
}: {
  notes: Note[];
  links: NoteLinks;
  onSelectNote: (noteId: string) => void;
  onSelectTag: (tag: string) => void;
}) {
  const tagLabels = useMemo(() => collectUniqueTags(notes), [notes]);

  const rows = useMemo(
    () =>
      notes
        .map((note) => {
          // `outgoing` contient une entrée par occurrence : deux `[[Projet]]`
          // dans la même note ne doivent donner qu'une seule puce.
          const seen = new Set<string>();
          const outgoing = (links.index.outgoing.get(note.id) ?? []).flatMap(
            (link) => {
              if (link.status !== "resolved" || seen.has(link.noteId)) return [];
              seen.add(link.noteId);
              return [{ id: link.noteId, title: link.title }];
            },
          );

          return { note, title: links.titleOf(note.id), outgoing };
        })
        .sort((a, b) => a.title.localeCompare(b.title, "fr")),
    [notes, links],
  );

  return (
    <ul className={styles.list}>
      {rows.map((row) => (
        <li key={row.note.id} className={styles.listItem}>
          <button
            type="button"
            className={styles.listTitle}
            onClick={() => onSelectNote(row.note.id)}
          >
            {row.title}
          </button>

          {row.outgoing.length > 0 && (
            <div className={styles.listLinks}>
              <span aria-hidden>→</span>
              {row.outgoing.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  className={styles.listLink}
                  onClick={() => onSelectNote(target.id)}
                >
                  {target.title}
                </button>
              ))}
            </div>
          )}

          {row.note.tags.length > 0 && (
            <div className={styles.listLinks}>
              {row.note.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={styles.listTag}
                  // Libellé canonique : le filtre de la page compare en strict.
                  onClick={() => onSelectTag(resolveOptionLabel(tagLabels, tag))}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
