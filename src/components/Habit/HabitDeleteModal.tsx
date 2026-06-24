import styles from "./HabitDeleteModal.module.css";

interface HabitDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  loading?: boolean;
}

export function HabitDeleteModal({
  visible,
  onClose,
  onConfirm,
  habitName,
  loading = false,
}: HabitDeleteModalProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <dialog
        open
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={styles.text}>
          Voulez-vous vraiment supprimer le tracking de &quot;{habitName}&quot; ?
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Non
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : "Oui"}
          </button>
        </div>
      </dialog>
    </div>
  );
}
