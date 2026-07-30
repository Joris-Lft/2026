import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormField } from "@/components/ui/FormField";
import { Input, ReadOnlyValue, Textarea } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import type { Deposit, DepositFormValue } from "@/types/travel-savings";
import styles from "./DepositModal.module.css";

interface DepositModalProps {
  isVisible: boolean;
  initialDeposit?: Deposit;
  authorName: string;
  onClose: () => void;
  onSubmit: (value: DepositFormValue) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function DepositModalContent({
  initialDeposit,
  authorName,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: Omit<DepositModalProps, "isVisible">) {
  const isEditing = !!initialDeposit;
  const [amount, setAmount] = useState(
    initialDeposit ? String(initialDeposit.amount) : "",
  );
  const [date, setDate] = useState(initialDeposit?.date || todayIso());
  const [note, setNote] = useState(initialDeposit?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const author = initialDeposit?.author || authorName;

  const handleSubmit = async () => {
    const amountValue = parseAmount(amount);
    if (amountValue == null || amountValue <= 0) {
      setError("Montant invalide");
      return;
    }
    if (!date) {
      setError("Veuillez saisir une date");
      return;
    }

    try {
      setError(null);
      await onSubmit({ amount: amountValue, date, note: note.trim() });
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Enregistrement impossible",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      setError(null);
      await onDelete();
      setIsConfirmVisible(false);
    } catch (deleteError) {
      setIsConfirmVisible(false);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Suppression impossible",
      );
    }
  };

  return (
    <>
      <Modal
        open
        portal
        onClose={onClose}
        title={isEditing ? "Modifier le versement" : "Nouveau versement"}
        titleId="deposit-title"
        footer={
          <ModalActions
            submitLabel={isSubmitting ? "Enregistrement..." : "Enregistrer"}
            onCancel={onClose}
            onSubmit={() => void handleSubmit()}
            loading={isSubmitting}
            submitDisabled={isSubmitting || isDeleting}
          />
        }
      >
        <FormField label="Versé par">
          <ReadOnlyValue>{author || "—"}</ReadOnlyValue>
        </FormField>

        <div className={styles.row}>
          <FormField label="Montant (€)" htmlFor="deposit-amount" error={error}>
            <Input
              id="deposit-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) setError(null);
              }}
              autoFocus
            />
          </FormField>
          <FormField label="Date" htmlFor="deposit-date">
            <Input
              id="deposit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Note" htmlFor="deposit-note" hint="Optionnel">
          <Textarea
            id="deposit-note"
            placeholder="Ex. virement mensuel, cadeau..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
        </FormField>

        {isEditing && onDelete && (
          <div className={styles.deleteSection}>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setIsConfirmVisible(true)}
              disabled={isSubmitting || isDeleting}
              loading={isDeleting}
            >
              Supprimer le versement
            </Button>
          </div>
        )}
      </Modal>

      {isEditing && onDelete && (
        <ConfirmModal
          open={isConfirmVisible}
          loading={isDeleting}
          onClose={() => setIsConfirmVisible(false)}
          onConfirm={() => void handleConfirmDelete()}
          message="Supprimer ce versement ?"
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}
    </>
  );
}

export function DepositModal({
  isVisible,
  initialDeposit,
  ...props
}: DepositModalProps) {
  if (!isVisible) return null;
  return (
    <DepositModalContent
      key={initialDeposit?.id ?? "new-deposit"}
      initialDeposit={initialDeposit}
      {...props}
    />
  );
}
