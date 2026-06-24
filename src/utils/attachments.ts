import type { NoteAttachment } from "@/types/notes";

const IMAGE_EXTENSION = /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?|$)/i;

export function isImageAttachment(attachment: NoteAttachment): boolean {
  if (attachment.type?.startsWith("image/")) return true;
  return (
    IMAGE_EXTENSION.test(attachment.filename) ||
    IMAGE_EXTENSION.test(attachment.url)
  );
}
