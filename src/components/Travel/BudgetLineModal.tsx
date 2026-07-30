import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { FormField } from "@/components/ui/FormField";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import {
  BUDGET_CATEGORIES,
  DEFAULT_SPEND_LEVEL,
  SPEND_LEVELS,
  type BudgetCategory,
  type BudgetLine,
  type BudgetLineInput,
  type SpendLevel,
} from "@/types/travel-budget";
import { PlaceSearchField } from "./PlaceSearchField";
import styles from "./BudgetLineModal.module.css";

interface BudgetLineModalProps {
  isVisible: boolean;
  initialLine?: BudgetLine;
  createDefaults?: { inBudget: boolean; toVisit: boolean };
  onClose: () => void;
  onSubmit: (value: BudgetLineInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
  isSubmitting?: boolean;
  isDeleting?: boolean;
}

function parseAmount(value: string): number | null {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function BudgetLineModalContent({
  initialLine,
  createDefaults,
  onClose,
  onSubmit,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
}: Omit<BudgetLineModalProps, "isVisible">) {
  const isEditing = !!initialLine;
  const [category, setCategory] = useState<BudgetCategory>(
    initialLine?.category ?? "Transport",
  );
  const [label, setLabel] = useState(initialLine?.label ?? "");
  const [spendLevel, setSpendLevel] = useState<SpendLevel>(
    initialLine?.spendLevel ?? DEFAULT_SPEND_LEVEL,
  );
  const [estimated, setEstimated] = useState(
    initialLine?.estimated != null ? String(initialLine.estimated) : "",
  );
  const [actual, setActual] = useState(
    initialLine?.actual != null ? String(initialLine.actual) : "",
  );
  const [notes, setNotes] = useState(initialLine?.notes ?? "");
  const [location, setLocation] = useState(initialLine?.location ?? "");
  const [inBudget, setInBudget] = useState(
    initialLine?.inBudget ?? createDefaults?.inBudget ?? false,
  );
  const [toVisit, setToVisit] = useState(
    initialLine?.toVisit ?? createDefaults?.toVisit ?? false,
  );
  const [error, setError] = useState<string | null>(null);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const handleSubmit = async () => {
    if (!label.trim()) {
      setError("Veuillez saisir un libellé");
      return;
    }
    const estimatedValue = parseAmount(estimated);
    if (estimated.trim() !== "" && (estimatedValue == null || estimatedValue < 0)) {
      setError("Montant estimé invalide");
      return;
    }
    const actualValue = parseAmount(actual);
    if (actual.trim() !== "" && (actualValue == null || actualValue < 0)) {
      setError("Montant réel invalide");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        category,
        label: label.trim(),
        estimated: estimatedValue,
        actual: actualValue,
        notes: notes.trim(),
        location: location.trim(),
        inBudget,
        toVisit,
        spendLevel,
      });
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
        title={isEditing ? "Modifier l'activité" : "Nouvelle activité"}
        titleId="budget-line-title"
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
        <FormField label="Catégorie" htmlFor="budget-category">
          <select
            id="budget-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Niveau de dépense"
          htmlFor="budget-spend-level"
          hint="Strict minimum = obligatoire · Confortable · Royal = superflu"
        >
          <select
            id="budget-spend-level"
            className={styles.select}
            value={spendLevel}
            onChange={(e) => setSpendLevel(e.target.value as SpendLevel)}
          >
            {SPEND_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Libellé" htmlFor="budget-label" error={error}>
          <Input
            id="budget-label"
            placeholder="Ex. Temple Kiyomizu-dera"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              if (error) setError(null);
            }}
            autoFocus
          />
        </FormField>

        <div className={styles.amountRow}>
          <FormField label="Estimé (€)" htmlFor="budget-estimated" hint="Optionnel">
            <Input
              id="budget-estimated"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="—"
              value={estimated}
              onChange={(e) => setEstimated(e.target.value)}
            />
          </FormField>
          <FormField label="Réel (€)" htmlFor="budget-actual" hint="Optionnel">
            <Input
              id="budget-actual"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="—"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="Lieu"
          hint="Cherche un lieu pour le placer sur la carte (ou colle des coordonnées « lat,lng »)"
        >
          <PlaceSearchField value={location} onChange={setLocation} />
        </FormField>

        <FormField label="Notes" htmlFor="budget-notes" hint="Optionnel">
          <Textarea
            id="budget-notes"
            placeholder="Infos utiles, réservation, remarques..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </FormField>

        <div className={styles.flags}>
          <label className={styles.flag}>
            <input
              type="checkbox"
              checked={toVisit}
              onChange={(e) => setToVisit(e.target.checked)}
            />
            <span>À visiter (apparaît dans les activités et sur la carte)</span>
          </label>
          <label className={styles.flag}>
            <input
              type="checkbox"
              checked={inBudget}
              onChange={(e) => setInBudget(e.target.checked)}
            />
            <span>Compter dans le budget</span>
          </label>
        </div>

        {isEditing && onDelete && (
          <div className={styles.deleteSection}>
            <Button
              variant="danger"
              fullWidth
              onClick={() => setIsConfirmVisible(true)}
              disabled={isSubmitting || isDeleting}
              loading={isDeleting}
            >
              Supprimer l'activité
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
          message="Supprimer cette activité ?"
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
        />
      )}
    </>
  );
}

export function BudgetLineModal({
  isVisible,
  initialLine,
  ...props
}: BudgetLineModalProps) {
  if (!isVisible) return null;
  return (
    <BudgetLineModalContent
      key={initialLine?.id ?? "new-line"}
      initialLine={initialLine}
      {...props}
    />
  );
}

