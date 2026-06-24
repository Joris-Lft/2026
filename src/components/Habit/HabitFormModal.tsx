import { useState } from "react";
import type {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  UpdateHabitInput,
} from "@/types/habits";
import styles from "./HabitFormModal.module.css";

interface HabitFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate?: (value: CreateHabitInput) => void;
  onUpdate?: (value: UpdateHabitInput) => void;
  editingHabit?: Habit;
}

function HabitFormModalContent({
  onClose,
  onCreate,
  onUpdate,
  editingHabit,
}: Omit<HabitFormModalProps, "isVisible">) {
  const [title, setTitle] = useState(
    () => editingHabit?.title ?? editingHabit?.name ?? "",
  );
  const [selectedType, setSelectedType] = useState<HabitFrequency>(
    () => editingHabit?.frequency ?? "daily",
  );
  const [startDate] = useState(new Date());

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Veuillez entrer un nom de tracking");
      return;
    }

    if (editingHabit) {
      onUpdate?.({
        id: editingHabit.id,
        name: title,
        frequency: selectedType,
        createdAt: startDate.toISOString().split("T")[0],
      });
    } else {
      onCreate?.({
        name: title,
        frequency: selectedType,
        createdAt: startDate.toISOString().split("T")[0],
      });
    }

    setTitle("");
    setSelectedType("daily");
    onClose();
  };

  const getDateLabel = () => {
    const displayDate = editingHabit
      ? new Date(editingHabit.created_at as string)
      : startDate;

    switch (selectedType) {
      case "daily":
        return displayDate.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      case "weekly": {
        const firstDayOfYear = new Date(displayDate.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (displayDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil(
          (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
        );
        return `Semaine ${weekNumber}`;
      }
      case "monthly":
        return displayDate.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <dialog
        open
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="habit-form-title"
      >
        <div className={styles.header}>
          <h2 id="habit-form-title" className={styles.modalTitle}>
            {editingHabit ? "Modifier le tracking" : "Ajouter un tracking"}
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Nom du tracking</span>
            <input
              className={styles.input}
              placeholder="Ex: Boire 2L d'eau"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>Fréquence</span>
            <div className={styles.typeToggle}>
              {(["daily", "weekly", "monthly"] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  className={`${styles.typeButton} ${selectedType === freq ? styles.typeButtonActive : ""}`}
                  onClick={() => setSelectedType(freq)}
                >
                  {freq === "daily" ? "Jour" : freq === "weekly" ? "Semaine" : "Mois"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>Date de début</span>
            <span className={styles.dateDisplay}>{getDateLabel()}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelLink} onClick={onClose}>
            Annuler
          </button>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            {editingHabit ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

export function HabitFormModal({
  isVisible,
  editingHabit,
  ...props
}: HabitFormModalProps) {
  if (!isVisible) return null;

  return (
    <HabitFormModalContent
      key={editingHabit?.id ?? "new"}
      editingHabit={editingHabit}
      {...props}
    />
  );
}
