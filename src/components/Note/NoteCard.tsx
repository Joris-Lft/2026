import type { Note } from "@/types/notes";
import { TagList } from "@/components/Tag/Tag";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { isImageAttachment } from "@/utils/attachments";
import styles from "./NoteCard.module.css";

interface NoteCardProps {
  note: Note;
  onOpen?: (note: Note) => void;
}

export function NoteCard({ note, onOpen }: NoteCardProps) {
  const formattedDate = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const imageAttachments = note.attachments.filter(isImageAttachment);
  const previewImage = imageAttachments[0];
  const extraImagesCount = imageAttachments.length > 1 ? imageAttachments.length - 1 : 0;

  return (
    <Card
      as="button"
      padded
      className={styles.card}
      onClick={() => onOpen?.(note)}
      aria-label={`Ouvrir la note${note.noteNumber > 0 ? ` #${note.noteNumber}` : ""}`}
    >
      <div className={styles.meta}>
        {note.noteNumber > 0 && (
          <span className={styles.noteNumber}>#{note.noteNumber}</span>
        )}
        {formattedDate && <time className={styles.date}>{formattedDate}</time>}
      </div>

      {note.content ? (
        <Markdown compact className={styles.content}>
          {note.content}
        </Markdown>
      ) : (
        <p className={styles.content}>—</p>
      )}

      <TagList tags={note.tags} className={styles.tags} />

      {previewImage && (
        <div className={styles.imagePreview}>
          <img
            src={previewImage.url}
            alt={previewImage.filename}
            className={styles.image}
            loading="lazy"
          />
          {extraImagesCount > 0 && (
            <span className={styles.moreImages}>+{extraImagesCount}</span>
          )}
        </div>
      )}
    </Card>
  );
}
