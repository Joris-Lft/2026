import { useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { getWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { H2 } from "@/components/H2";
import { HabitFormModal } from "@/components/Habit/HabitFormModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { HabitListSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  useDeleteHabit,
  usePeriodHabits,
  useToggleHabitLog,
  useUpdateHabit,
  type HabitWithStatus,
} from "@/hooks/use-habits";
import type { Habit } from "@/types/habits";
import type { PeriodData } from "@/types/tracking";
import type { UpdateHabitInput } from "@/types/habits";
import styles from "./PeriodHabit.module.css";

interface PeriodHabitProps {
  period: PeriodData["period"];
  isEditMode?: boolean;
}

export function PeriodHabit({ period, isEditMode = false }: PeriodHabitProps) {
  const { user } = useAuth();
  const { data: habits = [], isLoading } = usePeriodHabits(period, user?.email);
  const toggleLog = useToggleHabitLog(period, user?.id);
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<HabitWithStatus | undefined>();

  const sortedHabits = [...habits].sort(
    (a, b) => Number(a.completed) - Number(b.completed),
  );

  const getTitle = () => {
    const today = new Date();
    switch (period) {
      case "day":
        return `Aujourd'hui - ${today.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
        })}`;
      case "week":
        return `Semaine - ${getWeek(today, { weekStartsOn: 1, locale: fr })}`;
      case "month":
        return `Mois - ${today.getMonth() + 1}`;
    }
  };

  const editHabit = async (value: UpdateHabitInput) => {
    if (!value?.id) return;
    try {
      await updateHabitMutation.mutateAsync(value);
      setIsModalVisible(false);
      setEditingHabit(undefined);
    } catch (error) {
      console.error("Erreur lors de la modification de l'habit:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!habitToDelete) return;
    try {
      await deleteHabitMutation.mutateAsync(habitToDelete.id);
      setHabitToDelete(null);
      setIsDeleteModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'habit:", error);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.listContainer}>
        <H2 className={styles.title}>{getTitle()}</H2>

        {isLoading ? (
          <HabitListSkeleton rows={3} />
        ) : sortedHabits.length === 0 ? (
          <EmptyState>Aucun habit pour le moment</EmptyState>
        ) : (
          <ul className={styles.list}>
            {sortedHabits.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.habitItem}
                  onClick={() => {
                    if (!isEditMode) {
                      void toggleLog.mutateAsync(item);
                    }
                  }}
                  disabled={isEditMode || toggleLog.isPending}
                >
                  <span
                    className={`${styles.checkbox} ${item.completed ? styles.checkboxChecked : ""}`}
                    aria-hidden
                  >
                    {item.completed && <Check size={16} color="#fff" />}
                  </span>
                  <span
                    className={`${styles.habitTitle} ${item.completed ? styles.completedText : ""}`}
                  >
                    {item.title}
                  </span>

                  {isEditMode && (
                    <span className={styles.editActions}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHabit(item);
                          setIsModalVisible(true);
                        }}
                        aria-label="Modifier"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHabitToDelete(item);
                          setIsDeleteModalVisible(true);
                        }}
                        aria-label="Supprimer"
                      >
                        <Trash2 size={20} color="var(--color-danger)" />
                      </button>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <HabitFormModal
        isVisible={isModalVisible}
        onClose={() => {
          setIsModalVisible(false);
          setEditingHabit(undefined);
        }}
        onUpdate={editHabit}
        editingHabit={editingHabit}
      />

      {habitToDelete && (
        <ConfirmModal
          open={isDeleteModalVisible}
          loading={deleteHabitMutation.isPending}
          onClose={() => setIsDeleteModalVisible(false)}
          onConfirm={() => void handleConfirmDelete()}
          message={
            <>
              Voulez-vous vraiment supprimer le tracking de &quot;
              {habitToDelete.name}&quot; ?
            </>
          }
          confirmLabel="Oui"
          cancelLabel="Non"
        />
      )}
    </section>
  );
}
