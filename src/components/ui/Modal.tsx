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
}

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div
      className={joinClasses(
        styles.overlay,
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
}: ModalActionsProps) {
  return (
    <>
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
