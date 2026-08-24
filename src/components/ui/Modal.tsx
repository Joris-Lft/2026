import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "./Button";
import styles from "./Modal.module.css";

export type ModalVariant = "dialog" | "drawer";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  titleId?: string;
  titleExtra?: ReactNode;
  variant?: ModalVariant;
  footer?: ReactNode;
  children: ReactNode;
  maxWidth?: number;
  portal?: boolean;
  elevated?: boolean;
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Modales ouvertes, de la plus ancienne à la plus récente. */
const openModals: object[] = [];

export function Modal({
  open,
  onClose,
  title,
  titleId,
  titleExtra,
  variant = "dialog",
  footer,
  children,
  maxWidth,
  portal = false,
  elevated = false,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const token = {};
    openModals.push(token);

    // Seule la modale la plus haute réagit à Échap : sans ça, une confirmation
    // ouverte par-dessus un formulaire ferme les deux d'un coup.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openModals.at(-1) !== token) return;
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      const index = openModals.indexOf(token);
      if (index !== -1) openModals.splice(index, 1);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className={joinClasses(
        styles.overlay,
        elevated && styles.overlayElevated,
        variant === "drawer" && styles.drawerOverlay,
      )}
      onClick={onClose}
      role="presentation"
    >
      <dialog
        open
        className={joinClasses(
          styles.panel,
          variant === "drawer" && styles.drawerPanel,
        )}
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(event) => event.stopPropagation()}
        aria-labelledby={titleId}
      >
        {(title || titleExtra) && (
          <div className={styles.header}>
            <div className={styles.headerMain}>
              {title && (
                <h2 id={titleId} className={styles.title}>
                  {title}
                </h2>
              )}
              {titleExtra}
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        )}

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </dialog>
    </div>
  );

  return portal ? createPortal(content, document.body) : content;
}

interface ModalActionsProps {
  cancelLabel?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit?: () => void;
  submitType?: "button" | "submit";
  loading?: boolean;
  submitDisabled?: boolean;
  submitVariant?: "primary" | "danger";
  /** Action destructive optionnelle, isolée à gauche du footer pour l'éloigner du bouton de validation. */
  onDelete?: () => void;
  deleteLabel?: string;
  deleteLoading?: boolean;
}

export function ModalActions({
  cancelLabel = "Annuler",
  submitLabel,
  onCancel,
  onSubmit,
  submitType = "button",
  loading = false,
  submitDisabled = false,
  submitVariant = "primary",
  onDelete,
  deleteLabel = "Supprimer",
  deleteLoading = false,
}: ModalActionsProps) {
  return (
    <>
      {onDelete && (
        <Button
          variant="danger"
          className={styles.deleteAction}
          onClick={onDelete}
          loading={deleteLoading}
          disabled={loading}
        >
          {deleteLabel}
        </Button>
      )}
      <Button variant="secondary" fullWidth onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        variant={submitVariant}
        fullWidth
        type={submitType}
        onClick={onSubmit}
        loading={loading}
        disabled={submitDisabled}
      >
        {submitLabel}
      </Button>
    </>
  );
}
