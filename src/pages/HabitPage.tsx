import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCreateHabit } from "@/hooks/use-habits";
import type { CreateHabitInput } from "@/types/habits";
import { HabitFormModal } from "@/components/Habit/HabitFormModal";
import { PeriodHabit } from "@/components/Habit/PeriodHabit";
import type { PeriodData } from "@/types/tracking";
import styles from "./HabitPage.module.css";

const periods: PeriodData["period"][] = ["day", "week", "month"];

export function HabitPage() {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const createHabitMutation = useCreateHabit(user?.id);

  const addHabit = async (value: CreateHabitInput) => {
    if (!user?.id) return;
    try {
      await createHabitMutation.mutateAsync(value);
      setIsModalVisible(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'habit:", error);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Tracking</h1>

      <div className={styles.headerButtons}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? "Sortir du mode édition" : "Mode édition"}
        </button>

        {isEditMode && (
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => setIsModalVisible(true)}
          >
            + Ajouter un tracking
          </button>
        )}
      </div>

      <div className={styles.periods}>
        {periods.map((period) => (
          <PeriodHabit
            key={period}
            period={period}
            isEditMode={isEditMode}
          />
        ))}
      </div>

      <HabitFormModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onCreate={addHabit}
      />
    </div>
  );
}
