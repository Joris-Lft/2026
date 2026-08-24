import { useState } from "react";
import { format, getISOWeek } from "date-fns";
import { fr } from "date-fns/locale";
import type {
  CreateHabitInput,
  Habit,
  HabitFrequency,
  UpdateHabitInput,
} from "@/types/habits";
import { FormField } from "@/components/ui/FormField";
import { Input, ReadOnlyValue } from "@/components/ui/Input";
import { Modal, ModalActions } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface HabitFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate?: (value: CreateHabitInput) => void;
  onUpdate?: (value: UpdateHabitInput) => void;
  editingHabit?: Habit;
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string }[] = [
  { value: "daily", label: "Jour" },
  { value: "weekly", label: "Semaine" },
  { value: "monthly", label: "Mois" },
];

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Veuillez entrer un nom de tracking");
      return;
    }

    if (editingHabit) {
      // La date de début est en lecture seule dans le formulaire : on ne la
      // réécrit pas avec la date du jour.
      onUpdate?.({
        id: editingHabit.id,
        name: title,
        frequency: selectedType,
      });
    } else {
      onCreate?.({
        name: title,
        frequency: selectedType,
        // `format` et non `toISOString`, qui bascule sur la veille en soirée.
        createdAt: format(startDate, "yyyy-MM-dd"),
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

    // Mieux vaut ne rien afficher qu'une date inventée pour un habit existant.
    if (Number.isNaN(displayDate.getTime())) return "—";

    switch (selectedType) {
      case "daily":
        return format(displayDate, "dd/MM/yyyy", { locale: fr });
      case "weekly":
        return `Semaine ${getISOWeek(displayDate)}`;
      case "monthly":
        return format(displayDate, "MMMM yyyy", { locale: fr });
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editingHabit ? "Modifier le tracking" : "Ajouter un tracking"}
      titleId="habit-form-title"
      footer={
        <ModalActions
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={editingHabit ? "Modifier" : "Ajouter"}
        />
      }
    >
      <FormField label="Nom du tracking" htmlFor="habit-title" error={error}>
        <Input
          id="habit-title"
          placeholder="Ex: Boire 2L d'eau"
          value={title}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
        />
      </FormField>

      <FormField label="Fréquence">
        <SegmentedControl
          ariaLabel="Fréquence du tracking"
          value={selectedType}
          options={FREQUENCY_OPTIONS}
          onChange={setSelectedType}
        />
      </FormField>

      <FormField label="Date de début">
        <ReadOnlyValue>{getDateLabel()}</ReadOnlyValue>
      </FormField>
    </Modal>
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
