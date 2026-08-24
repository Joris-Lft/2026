import { useMemo } from "react";
import { Link2 } from "lucide-react";
import type { Note } from "@/types/notes";
import { TagList } from "@/components/Tag/Tag";
import { Card } from "@/components/ui/Card";
import { Markdown } from "@/components/ui/Markdown";
import { isImageAttachment } from "@/utils/attachments";
import { deriveNoteTitle } from "@/utils/notes";
import type { WikiLinkResolution } from "@/utils/wikilinks";
import styles from "./NoteCard.module.css";

interface NoteCardProps {
  note: Note;
  onOpen?: (note: Note) => void;
  /** Rend les `[[...]]` de l'aperçu, sans les rendre cliquables. */
  resolveWikiLink?: (target: string, currentNoteId?: string) => WikiLinkResolution;
  /** Nombre de notes reliées, affiché en pastille. */
  linkCount?: number;
}

export function NoteCard({
  note,
  onOpen,
  resolveWikiLink,
  linkCount = 0,
}: NoteCardProps) {
  // Pas de onNavigate : la racine de la carte est déjà un <button>, un bouton
  // imbriqué serait invalide. Les liens s'affichent stylés mais inertes.
  const wikiLinks = useMemo(
    () =>
      resolveWikiLink
        ? { resolve: (target: string) => resolveWikiLink(target, note.id) }
        : undefined,
    [resolveWikiLink, note.id],
  );

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
      aria-label={`Ouvrir la note « ${deriveNoteTitle(note)} »`}
    >
      <div className={styles.meta}>
        {note.noteNumber > 0 && (
          <span className={styles.noteNumber}>#{note.noteNumber}</span>
        )}
        {formattedDate && <time className={styles.date}>{formattedDate}</time>}
        {linkCount > 0 && (
          <span className={styles.linkCount}>
            <Link2 size={12} aria-hidden />
            {linkCount}
            <span className={styles.srOnly}>
              {` note${linkCount > 1 ? "s" : ""} reliée${linkCount > 1 ? "s" : ""}`}
            </span>
          </span>
        )}
      </div>

      {note.content ? (
        <Markdown compact className={styles.content} wikiLinks={wikiLinks}>
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
