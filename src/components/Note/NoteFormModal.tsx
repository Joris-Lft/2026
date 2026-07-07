import { useEffect, useState } from "react";
import type { Note, NoteFormInput } from "@/types/notes";
import { TagList, TagSelect } from "@/components/Tag/Tag";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Input";
import { Markdown } from "@/components/ui/Markdown";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useInvitees, useUserDirectory } from "@/hooks/use-users";
import { isImageAttachment } from "@/utils/attachments";
import { uploadImageFiles } from "@/utils/upload-image";
import styles from "./NoteFormModal.module.css";

interface NoteFormModalProps {
  isVisible: boolean;
  currentUserId: string;
  initialNote?: Note;
  availableTags?: string[];
  onClose: () => void;
  onSubmit: (value: NoteFormInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ModalMode = "view" | "edit";

function NoteFormModalContent({
  currentUserId,
  initialNote,
  availableTags = [],
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: Omit<NoteFormModalProps, "isVisible">) {
  const isExistingNote = !!initialNote;
  const [mode, setMode] = useState<ModalMode>(isExistingNote ? "view" : "edit");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const { data: invitees = [], isLoading: isLoadingUsers } =
    useInvitees(currentUserId);
  const { data: userDirectory } = useUserDirectory();

  const [content, setContent] = useState(() => initialNote?.content ?? "");
  const [inviteeIds, setInviteeIds] = useState<string[]>(() =>
    initialNote
      ? initialNote.assigneeIds.filter((id) => id !== currentUserId)
      : [],
  );
  const [keptAttachmentUrls, setKeptAttachmentUrls] = useState<string[]>(() =>
    initialNote ? initialNote.attachments.map((a) => a.url) : [],
  );
  const [tags, setTags] = useState<string[]>(() => initialNote?.tags ?? []);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (availableTags.length === 0) return;
    setTags((current) => current.filter((tag) => availableTags.includes(tag)));
  }, [availableTags]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [pendingImages]);

  const willBeCommune = inviteeIds.length > 0;

  const handleClose = () => {
    pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    onClose();
  };

  const handleCancelEdit = () => {
    if (isExistingNote) {
      setContent(initialNote.content);
      setInviteeIds(
        initialNote.assigneeIds.filter((id) => id !== currentUserId),
      );
      setKeptAttachmentUrls(initialNote.attachments.map((a) => a.url));
      setTags(
        initialNote.tags.filter((tag) => availableTags.includes(tag)),
      );
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setPendingImages([]);
      setError(null);
      setMode("view");
      return;
    }

    handleClose();
  };

  const toggleInvitee = (userId: string) => {
    setInviteeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) return;

    const next = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingImages((prev) => [...prev, ...next]);
    event.target.value = "";
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  const removeKeptAttachment = (url: string) => {
    setKeptAttachmentUrls((prev) => prev.filter((item) => item !== url));
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Veuillez saisir le contenu de la note");
      return;
    }

    try {
      setError(null);
      const uploadedUrls = await uploadImageFiles(
        pendingImages.map((image) => image.file),
      );

      await onSubmit({
        content: content.trim(),
        inviteeIds,
        attachmentUrls: [...keptAttachmentUrls, ...uploadedUrls],
        tags,
      });

      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      onClose();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : isExistingNote
            ? "Impossible de modifier la note"
            : "Impossible de créer la note";
      setError(message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    try {
      setError(null);
      await onDelete();
      setIsDeleteModalVisible(false);
    } catch (deleteError) {
      setIsDeleteModalVisible(false);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la note",
      );
    }
  };

  const formattedDate = initialNote?.createdAt
    ? new Date(initialNote.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const sharedWithEmails =
    userDirectory?.users
      .filter(
        (user) =>
          user.id !== currentUserId &&
          initialNote?.assigneeIds.includes(user.id),
      )
      .map((user) => user.email) ?? [];

  const imageAttachments =
    initialNote?.attachments.filter(isImageAttachment) ?? [];

  const title =
    mode === "view"
      ? initialNote && initialNote.noteNumber > 0
        ? `Note #${initialNote.noteNumber}`
        : "Note"
      : isExistingNote
        ? "Modifier la note"
        : "Nouvelle note";

  const statusBadge =
    mode === "view" && initialNote ? (
      <span
        className={
          initialNote.status === "Commune"
            ? styles.statusCommune
            : styles.statusPerso
        }
      >
        {initialNote.status}
      </span>
    ) : undefined;

  return (
    <>
    <Modal
      open
      portal
      variant="drawer"
      onClose={handleClose}
      title={title}
      titleId="note-modal-title"
      titleExtra={statusBadge}
      footer={
        mode === "view" && initialNote ? (
          <>
            <Button variant="secondary" fullWidth onClick={handleClose}>
              Fermer
            </Button>
            <Button fullWidth onClick={() => setMode("edit")}>
              Modifier
            </Button>
          </>
        ) : (
          <ModalActions
            cancelLabel={isExistingNote ? "Retour" : "Annuler"}
            submitLabel={
              isSubmitting
                ? isExistingNote
                  ? "Enregistrement..."
                  : "Création..."
                : isExistingNote
                  ? "Enregistrer"
                  : "Créer"
            }
            onCancel={handleCancelEdit}
            onSubmit={() => void handleSubmit()}
            loading={isSubmitting}
            submitDisabled={isSubmitting || isDeleting}
          />
        )
      }
    >
      {mode === "view" && initialNote ? (
        <div className={styles.readBody}>
          {formattedDate && (
            <time className={styles.readMeta} dateTime={initialNote.createdAt}>
              {formattedDate}
            </time>
          )}

          {initialNote.content ? (
            <Markdown className={styles.readContent}>
              {initialNote.content}
            </Markdown>
          ) : (
            <p className={styles.readContent}>—</p>
          )}

          {initialNote.tags.length > 0 && (
            <TagList tags={initialNote.tags} />
          )}

          {imageAttachments.length > 0 && (
            <div className={styles.readGallery}>
              {imageAttachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.readImageLink}
                >
                  <img
                    src={attachment.url}
                    alt={attachment.filename}
                    className={styles.readImage}
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          )}

          {initialNote.status === "Commune" && sharedWithEmails.length > 0 && (
            <p className={styles.readShare}>
              Partagée avec {sharedWithEmails.join(", ")}
            </p>
          )}
        </div>
      ) : (
        <>
          <FormField
            label="Contenu"
            htmlFor="note-content"
            hint="Markdown supporté (titres, listes, tableaux…)"
            error={error}
          >
            <Textarea
              id="note-content"
              placeholder="Écrivez votre note..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (error) setError(null);
              }}
              rows={5}
            />
          </FormField>

          <div className={styles.imagesSection}>
            <span className={styles.sectionLabel}>Images</span>
            <p className={styles.hint}>
              Formats acceptés : JPG, PNG, GIF, WebP…
            </p>

            <label className={styles.fileInputLabel}>
              Ajouter des images
              <input
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={handleImageSelect}
                disabled={isSubmitting}
              />
            </label>

            {(keptAttachmentUrls.length > 0 || pendingImages.length > 0) && (
              <div className={styles.imagePreviewGrid}>
                {keptAttachmentUrls.map((url) => (
                  <div key={url} className={styles.imagePreviewItem}>
                    <img src={url} alt="" className={styles.imagePreview} />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => removeKeptAttachment(url)}
                      aria-label="Retirer l'image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {pendingImages.map((image) => (
                  <div key={image.id} className={styles.imagePreviewItem}>
                    <img
                      src={image.previewUrl}
                      alt=""
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      className={styles.removeImageButton}
                      onClick={() => removePendingImage(image.id)}
                      aria-label="Retirer l'image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <FormField
            label="Tags"
            hint="Sélectionnez parmi les tags configurés dans Airtable"
          >
            <TagSelect
              options={availableTags}
              value={tags}
              onChange={setTags}
              disabled={isSubmitting}
              emptyMessage="Aucun tag configuré dans Airtable"
            />
          </FormField>

          <FormField
            label="Partager avec"
            hint={
              willBeCommune
                ? "Note commune — visible par les personnes invitées"
                : "Sans invitation, la note reste personnelle"
            }
          >
            {isLoadingUsers ? (
              <div className={styles.usersLoading}>
                <Skeleton variant="habitRow" />
                <Skeleton variant="habitRow" />
              </div>
            ) : invitees.length === 0 ? (
              <p className={styles.noUsers}>
                Aucun autre utilisateur disponible
              </p>
            ) : (
              <ul className={styles.userList}>
                {invitees.map((user) => (
                  <li key={user.id}>
                    <label className={styles.userOption}>
                      <input
                        type="checkbox"
                        checked={inviteeIds.includes(user.id)}
                        onChange={() => toggleInvitee(user.id)}
                      />
                      <span>{user.email}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </FormField>

          {isExistingNote && onDelete && (
            <div className={styles.deleteSection}>
              <Button
                variant="danger"
                fullWidth
                onClick={() => setIsDeleteModalVisible(true)}
                disabled={isSubmitting || isDeleting}
                loading={isDeleting}
              >
                Supprimer la note
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>

      {isExistingNote && onDelete && (
        <ConfirmModal
          open={isDeleteModalVisible}
          loading={isDeleting}
          onClose={() => setIsDeleteModalVisible(false)}
          onConfirm={() => void handleConfirmDelete()}
          message="Voulez-vous vraiment supprimer cette note ? Cette action est irréversible."
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}
    </>
  );
}

export function NoteFormModal({
  isVisible,
  initialNote,
  ...props
}: NoteFormModalProps) {
  if (!isVisible) return null;

  return (
    <NoteFormModalContent
      key={initialNote?.id ?? "new-note"}
      initialNote={initialNote}
      {...props}
    />
  );
}
