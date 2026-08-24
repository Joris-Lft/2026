import { useMemo, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { format, getISOWeek, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { H2 } from "@/components/H2";
import { HabitFormModal } from "@/components/Habit/HabitFormModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HabitListSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/auth-context";
import {
  useCurrentPeriodKeys,
  useDeleteHabit,
  usePeriodHabits,
  useToggleHabitLog,
  useTogglingHabitIds,
  useUpdateHabit,
  type HabitWithStatus,
} from "@/hooks/use-habits";
import type { Habit } from "@/types/habits";
import type { PeriodType } from "@/types/tracking";
import type { UpdateHabitInput } from "@/types/habits";
import styles from "./PeriodHabit.module.css";

interface PeriodHabitProps {
  period: PeriodType;
  isEditMode?: boolean;
}

export function PeriodHabit({ period, isEditMode = false }: PeriodHabitProps) {
  const { user } = useAuth();
  // `isLoadingError` et non `isError` : un refetch d'arrière-plan qui échoue
  // ne doit pas remplacer une liste déjà chargée par un message d'erreur.
  const { data: habits = [], isLoading, isLoadingError } = usePeriodHabits(
    period,
    user?.email,
  );
  const toggleLog = useToggleHabitLog(period, user?.id, user?.email);
  const togglingHabitIds = useTogglingHabitIds(period, user?.email);
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<HabitWithStatus | undefined>();

  // Même source de vérité que les requêtes : l'en-tête suit donc le passage de
  // minuit au lieu de rester figé sur la veille.
  const periodKeys = useCurrentPeriodKeys();
  const today = useMemo(() => parseISO(periodKeys.daily), [periodKeys.daily]);

  // Ordre alphabétique du service, sans reclassement des lignes cochées : avec
  // la bascule optimiste, la ligne se déplaçait sous le doigt au moment du clic.
  const completedCount = habits.filter((habit) => habit.completed).length;

  const getTitle = () => {
    switch (period) {
      case "day":
        return `Aujourd'hui - ${format(today, "dd/MM", { locale: fr })}`;
      case "week":
        return `Semaine ${getISOWeek(today)}`;
      case "month": {
        const month = format(today, "LLLL", { locale: fr });
        return month.charAt(0).toUpperCase() + month.slice(1);
      }
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
        <div className={styles.header}>
          <H2 className={styles.title}>{getTitle()}</H2>
          <ProgressBar
            value={completedCount}
            max={habits.length}
            ariaLabel={`Progression : ${completedCount} sur ${habits.length}`}
          />
        </div>

        {isLoading ? (
          <HabitListSkeleton rows={3} />
        ) : isLoadingError ? (
          <p className={styles.error} role="alert">
            Impossible de charger les trackings. Vérifiez votre connexion.
          </p>
        ) : habits.length === 0 ? (
          <EmptyState>Aucun habit pour le moment</EmptyState>
        ) : (
          <ul className={styles.list}>
            {habits.map((item) => (
              /* Les actions sont sœurs du bouton de ligne, jamais imbriquées :
                 un bouton dans un bouton est du HTML invalide, et le clic
                 n'atteignait pas React dès que la ligne était désactivée. */
              <li key={item.id} className={styles.row}>
                <button
                  type="button"
                  className={styles.habitItem}
                  onClick={() => toggleLog.mutate(item)}
                  disabled={isEditMode || togglingHabitIds.has(item.id)}
                  aria-pressed={item.completed}
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
                </button>

                {isEditMode && (
                  <span className={styles.editActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => {
                        setEditingHabit(item);
                        setIsModalVisible(true);
                      }}
                      aria-label={`Modifier ${item.title}`}
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => {
                        setHabitToDelete(item);
                        setIsDeleteModalVisible(true);
                      }}
                      aria-label={`Supprimer ${item.title}`}
                    >
                      <Trash2 size={20} color="var(--color-danger)" />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {toggleLog.isError && (
          <p className={styles.error} role="alert">
            Impossible d&apos;enregistrer la coche. Réessayez.
          </p>
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
