import { useMemo, useState } from "react";
import { NoteCard } from "@/components/Note/NoteCard";
import { NoteFormModal } from "@/components/Note/NoteFormModal";
import { TagFilter } from "@/components/Tag/Tag";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { NotesPageSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  useCreateNote,
  useDeleteNote,
  useNoteTagOptions,
  useNotes,
  useUpdateNote,
} from "@/hooks/use-notes";
import type { Note, NoteFormInput } from "@/types/notes";
import { filterNotesByTags } from "@/utils/tags";
import { splitNotesByStatus } from "@/utils/notes";
import styles from "./NotesPage.module.css";

export function NotesPage() {
  const { user } = useAuth();
  const { data: notes = [], isLoading, isError } = useNotes(user?.email);
  const { options: availableTags } = useNoteTagOptions(notes);
  const createNoteMutation = useCreateNote(user?.id, user?.email);
  const updateNoteMutation = useUpdateNote(user?.id, user?.email);
  const deleteNoteMutation = useDeleteNote(user?.email);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredNotes = useMemo(
    () => filterNotesByTags(notes, selectedTags),
    [notes, selectedTags],
  );
  const { perso, commune } = splitNotesByStatus(filteredNotes);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting =
    createNoteMutation.isPending ||
    updateNoteMutation.isPending ||
    deleteNoteMutation.isPending;
  const hasNotes = notes.length > 0;
  const hasFilteredNotes = perso.length > 0 || commune.length > 0;
  const isEmpty = !isLoading && !isError && !hasNotes;
  const isFilterEmpty =
    !isLoading && !isError && hasNotes && selectedTags.length > 0 && !hasFilteredNotes;

  const openCreateModal = () => {
    setFormError(null);
    setSelectedNote(undefined);
    setIsModalVisible(true);
  };

  const openEditModal = (note: Note) => {
    setFormError(null);
    setSelectedNote(note);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedNote(undefined);
  };

  const handleSubmit = async (value: NoteFormInput) => {
    setFormError(null);

    try {
      if (selectedNote) {
        await updateNoteMutation.mutateAsync({ ...value, id: selectedNote.id });
      } else {
        await createNoteMutation.mutateAsync(value);
      }
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Enregistrement impossible";
      setFormError(message);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    setFormError(null);

    try {
      await deleteNoteMutation.mutateAsync(selectedNote.id);
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Suppression impossible";
      setFormError(message);
      throw error;
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Notes"
        align="center"
        actions={
          <Button pill onClick={openCreateModal}>
            Nouvelle note
          </Button>
        }
      />

      {formError && <p className={styles.errorBanner}>{formError}</p>}

      {isLoading ? (
        <NotesPageSkeleton />
      ) : isError ? (
        <EmptyState>Impossible de charger les notes</EmptyState>
      ) : isEmpty ? (
        <EmptyState>Aucune note pour le moment</EmptyState>
      ) : (
        <>
          <TagFilter
            tags={availableTags}
            selectedTags={selectedTags}
            onChange={setSelectedTags}
          />

          {isFilterEmpty ? (
            <EmptyState>Aucune note ne correspond aux tags sélectionnés</EmptyState>
          ) : (
            <div className={styles.sections}>
              {perso.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Perso</h2>
                  <div className={styles.noteList}>
                    {perso.map((note) => (
                      <NoteCard key={note.id} note={note} onOpen={openEditModal} />
                    ))}
                  </div>
                </section>
              )}

              {perso.length > 0 && commune.length > 0 && (
                <hr className={styles.separator} aria-hidden />
              )}

              {commune.length > 0 && (
                <section className={styles.section}>
                  <h2 className={styles.sectionTitle}>Commune</h2>
                  <div className={styles.noteList}>
                    {commune.map((note) => (
                      <NoteCard key={note.id} note={note} onOpen={openEditModal} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}

      {isModalVisible && user?.id && (
        <NoteFormModal
          isVisible={isModalVisible}
          currentUserId={user.id}
          initialNote={selectedNote}
          availableTags={availableTags}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onDelete={selectedNote ? handleDelete : undefined}
          isSubmitting={isSubmitting}
          isDeleting={deleteNoteMutation.isPending}
        />
      )}
    </PageShell>
  );
}
