import { useState } from "react";
import { NoteCard } from "@/components/Note/NoteCard";
import { NoteFormModal } from "@/components/Note/NoteFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { NotesPageSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useCreateNote, useNotes, useUpdateNote } from "@/hooks/use-notes";
import type { Note, NoteFormInput } from "@/types/notes";
import { splitNotesByStatus } from "@/utils/notes";
import styles from "./NotesPage.module.css";

export function NotesPage() {
  const { user } = useAuth();
  const { data: notes = [], isLoading, isError } = useNotes(user?.email);
  const createNoteMutation = useCreateNote(user?.id, user?.email);
  const updateNoteMutation = useUpdateNote(user?.id, user?.email);
  const { perso, commune } = splitNotesByStatus(notes);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = createNoteMutation.isPending || updateNoteMutation.isPending;
  const isEmpty = !isLoading && !isError && perso.length === 0 && commune.length === 0;

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

      {isModalVisible && user?.id && (
        <NoteFormModal
          isVisible={isModalVisible}
          currentUserId={user.id}
          initialNote={selectedNote}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </PageShell>
  );
}
