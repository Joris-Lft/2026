import type { ReactNode } from "react";
import { Modal, ModalActions } from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  loading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      footer={
        <ModalActions
          cancelLabel={cancelLabel}
          submitLabel={confirmLabel}
          onCancel={onClose}
          onSubmit={onConfirm}
          loading={loading}
        />
      }
    >
      <p style={{ margin: 0, textAlign: "center", lineHeight: 1.5 }}>{message}</p>
    </Modal>
  );
}
