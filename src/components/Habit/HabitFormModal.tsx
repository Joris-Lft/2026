import { useState } from "react";
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
      <FormField label="Nom du tracking" htmlFor="habit-title">
        <Input
          id="habit-title"
          placeholder="Ex: Boire 2L d'eau"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
